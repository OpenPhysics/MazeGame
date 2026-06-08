/**
 * ArenaPaints.ts
 *
 * Procedural fills and overlay graphics for the maze arena (walls, particle, goal).
 * Colors come from MazeGameColors; geometry scales with view tile size.
 */

import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, Color, Node, Path, Pattern, RadialGradient, VoicingNode } from "scenerystack/scenery";
import MazeGameColors, { TRANSPARENT_COLOR } from "../../MazeGameColors.js";
import MazeGameLayoutConstants from "../MazeGameLayoutConstants.js";

function toColor(paint: Color | string): Color {
  return paint instanceof Color ? paint : Color.toColor(paint);
}

const goalStarFillLightColorProperty = new DerivedProperty(
  [MazeGameColors.goalStarFillColorProperty],
  (color: Color | string): Color => toColor(color).brighterColor(MazeGameLayoutConstants.ARENA_GOAL_STAR_FACET_BRIGHTEN_FACTOR),
);

const goalStarFillDarkColorProperty = new DerivedProperty(
  [MazeGameColors.goalStarFillColorProperty],
  (color: Color | string): Color => toColor(color).darkerColor(MazeGameLayoutConstants.ARENA_GOAL_STAR_FACET_DARKEN_FACTOR),
);

/**
 * Repeatable brick-wall pattern for wall tiles.
 */
export function createBrickWallPattern(tileSizeView: number, wallColor: Color, shadowColor: Color): Pattern {
  const unit = Math.max(MazeGameLayoutConstants.ARENA_BRICK_PATTERN_MIN_UNIT_PX, Math.round(tileSizeView));
  const canvas = document.createElement("canvas");
  canvas.width = unit;
  canvas.height = unit;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D context is unavailable for wall texture.");
  }

  const mortar = shadowColor.toCSS();
  const brick = wallColor.toCSS();
  const highlight = wallColor.brighterColor(MazeGameLayoutConstants.ARENA_BRICK_HIGHLIGHT_FACTOR).toCSS();
  const shade = wallColor.darkerColor(MazeGameLayoutConstants.ARENA_BRICK_SHADE_FACTOR).toCSS();
  const mortarWidth = Math.max(1, Math.round(unit * MazeGameLayoutConstants.ARENA_BRICK_MORTAR_RATIO));
  const rowHeight = Math.floor(
    (unit - mortarWidth * (MazeGameLayoutConstants.ARENA_BRICK_ROW_COUNT + 1)) /
      MazeGameLayoutConstants.ARENA_BRICK_ROW_COUNT,
  );
  const brickHeight = Math.max(1, rowHeight);

  context.fillStyle = mortar;
  context.fillRect(0, 0, unit, unit);

  const drawBrick = (x: number, y: number, width: number, height: number, shaded: boolean): void => {
    context.fillStyle = brick;
    context.fillRect(x, y, width, height);
    context.fillStyle = shaded ? shade : highlight;
    context.fillRect(x, y, width, Math.max(1, Math.floor(height * MazeGameLayoutConstants.ARENA_BRICK_TOP_BAND_RATIO)));
    context.fillStyle = shaded ? highlight : shade;
    context.fillRect(
      x,
      y + height - Math.max(1, Math.floor(height * MazeGameLayoutConstants.ARENA_BRICK_BOTTOM_BAND_RATIO)),
      width,
      Math.max(1, Math.floor(height * MazeGameLayoutConstants.ARENA_BRICK_BOTTOM_BAND_RATIO)),
    );
  };

  let rowY = mortarWidth;
  for (let row = 0; row < MazeGameLayoutConstants.ARENA_BRICK_ROW_COUNT; row++) {
    const offset =
      row % 2 === 0
        ? mortarWidth
        : mortarWidth + Math.floor(unit * MazeGameLayoutConstants.ARENA_BRICK_ROW_OFFSET_RATIO);
    const brickWidth = Math.floor((unit - offset - mortarWidth) / 2);
    drawBrick(offset, rowY, Math.max(1, brickWidth), brickHeight, row === 1);
    const secondX = offset + brickWidth + mortarWidth;
    const secondWidth = unit - secondX - mortarWidth;
    if (secondWidth > 0) {
      drawBrick(secondX, rowY, secondWidth, brickHeight, row === 0);
    }
    rowY += brickHeight + mortarWidth;
  }

  const image = new Image();
  image.src = canvas.toDataURL();
  return new Pattern(image);
}

/**
 * Glossy sphere fill for the player particle (theme-aware via color properties).
 */
export function createParticleRadialFill(radiusView: number): RadialGradient {
  const highlightOffset = radiusView * MazeGameLayoutConstants.ARENA_PARTICLE_RADIAL_HIGHLIGHT_OFFSET_RATIO;
  return new RadialGradient(-highlightOffset, -highlightOffset, 0, 0, 0, radiusView)
    .addColorStop(
      MazeGameLayoutConstants.ARENA_PARTICLE_RADIAL_STOP_HIGHLIGHT,
      MazeGameColors.particleHighlightColorProperty,
    )
    .addColorStop(MazeGameLayoutConstants.ARENA_PARTICLE_RADIAL_STOP_BODY, MazeGameColors.particleColorProperty)
    .addColorStop(MazeGameLayoutConstants.ARENA_PARTICLE_RADIAL_STOP_SHADE, MazeGameColors.particleShadeColorProperty)
    .addColorStop(
      MazeGameLayoutConstants.ARENA_PARTICLE_RADIAL_STOP_STROKE,
      MazeGameColors.particleStrokeColorProperty,
    );
}

/**
 * Soft outer glow behind the particle.
 */
export function createParticleGlowFill(radiusView: number): RadialGradient {
  const glowRadius = radiusView * MazeGameLayoutConstants.ARENA_PARTICLE_GLOW_GRADIENT_OUTER_RATIO;
  return new RadialGradient(
    0,
    0,
    radiusView * MazeGameLayoutConstants.ARENA_PARTICLE_GLOW_GRADIENT_INNER_RATIO,
    0,
    0,
    glowRadius,
  )
    .addColorStop(0, MazeGameColors.particleGlowColorProperty)
    .addColorStop(1, TRANSPARENT_COLOR);
}

export type ParticleVisualNodes = {
  readonly root: VoicingNode;
  readonly glow: Circle;
  readonly body: Circle;
  readonly specular: Circle;
};

/**
 * Layered circles: glow, shaded body, and specular highlight.
 */
export function createParticleVisual(radiusView: number): ParticleVisualNodes {
  const glow = new Circle(radiusView * MazeGameLayoutConstants.ARENA_PARTICLE_GLOW_RADIUS_RATIO, {
    fill: createParticleGlowFill(radiusView),
    pickable: false,
  });
  const body = new Circle(radiusView, {
    fill: createParticleRadialFill(radiusView),
    stroke: MazeGameColors.particleStrokeColorProperty,
    lineWidth: Math.max(1, radiusView * MazeGameLayoutConstants.ARENA_PARTICLE_BODY_STROKE_RATIO),
  });
  const specular = new Circle(radiusView * MazeGameLayoutConstants.ARENA_PARTICLE_SPECULAR_RADIUS_RATIO, {
    fill: MazeGameColors.particleSpecularColorProperty,
    centerX: -radiusView * MazeGameLayoutConstants.ARENA_PARTICLE_SPECULAR_OFFSET_X_RATIO,
    centerY: -radiusView * MazeGameLayoutConstants.ARENA_PARTICLE_SPECULAR_OFFSET_Y_RATIO,
    pickable: false,
  });
  const root = new VoicingNode({ children: [glow, body, specular] });
  return { root, glow, body, specular };
}

/**
 * Bullseye rings and star marker on the finish tile.
 */
export function createGoalOverlayNode(tileSizeView: number): Node {
  const size = tileSizeView;
  if (size <= 0) {
    return new Node({ pickable: false });
  }

  const center = size / 2;
  const ringStroke = Math.max(1, size * MazeGameLayoutConstants.ARENA_GOAL_RING_STROKE_RATIO);
  const [outerRadiusRatio, middleRadiusRatio, innerRadiusRatio] =
    MazeGameLayoutConstants.ARENA_GOAL_RING_RADIUS_RATIOS;

  const glowRadius = Math.max(1, size * MazeGameLayoutConstants.ARENA_GOAL_BACKDROP_GLOW_RADIUS_RATIO);
  const backdropGlow = new Circle(glowRadius, {
    fill: new RadialGradient(0, 0, 0, 0, 0, glowRadius)
      .addColorStop(0, MazeGameColors.goalBackdropGlowColorProperty)
      .addColorStop(0.5, MazeGameColors.goalBackdropGlowMidColorProperty)
      .addColorStop(1, TRANSPARENT_COLOR),
    center: new Vector2(center, center),
    pickable: false,
  });

  const outerRadius = size * outerRadiusRatio;
  const middleRadius = size * middleRadiusRatio;
  const innerRadius = size * innerRadiusRatio;

  const ringsGlowShape = new Shape();
  ringsGlowShape.circle(center, center, outerRadius);
  ringsGlowShape.circle(center, center, middleRadius);
  ringsGlowShape.circle(center, center, innerRadius);

  const ringsGlow = new Path(ringsGlowShape, {
    stroke: MazeGameColors.goalMarkerColorProperty,
    lineWidth: ringStroke * MazeGameLayoutConstants.ARENA_GOAL_RING_GLOW_STROKE_FACTOR,
    opacity: MazeGameLayoutConstants.ARENA_GOAL_RING_GLOW_OPACITY,
    pickable: false,
  });

  const solidRingsShape = new Shape();
  solidRingsShape.circle(center, center, outerRadius);
  solidRingsShape.circle(center, center, innerRadius);

  const solidRings = new Path(solidRingsShape, {
    stroke: MazeGameColors.goalMarkerColorProperty,
    lineWidth: ringStroke,
    pickable: false,
  });

  const dashedRingShape = new Shape();
  dashedRingShape.circle(center, center, middleRadius);

  const dashedRing = new Path(dashedRingShape, {
    stroke: MazeGameColors.goalMarkerColorProperty,
    lineWidth: ringStroke,
    lineDash: [size * MazeGameLayoutConstants.ARENA_GOAL_DASHED_RING_DASH_RATIO, size * MazeGameLayoutConstants.ARENA_GOAL_DASHED_RING_DASH_RATIO],
    pickable: false,
  });

  // 4. Faceted 3D Star:
  // Alternate wedges in lighter and darker shades of the theme star-fill color
  const starRadius = size * MazeGameLayoutConstants.ARENA_GOAL_STAR_RADIUS_RATIO;
  const starInnerRadius = starRadius * MazeGameLayoutConstants.ARENA_GOAL_STAR_INNER_RADIUS_RATIO;

  const starNode = new Node({ pickable: false });
  const starStrokeWidth = Math.max(1, size * MazeGameLayoutConstants.ARENA_GOAL_STAR_STROKE_RATIO);

  for (let i = 0; i < 10; i++) {
    const fillProperty = i % 2 === 0 ? goalStarFillLightColorProperty : goalStarFillDarkColorProperty;
    const angle1 = (i * Math.PI) / 5 - Math.PI / 2;
    const angle2 = ((i + 1) * Math.PI) / 5 - Math.PI / 2;
    const r1 = i % 2 === 0 ? starRadius : starInnerRadius;
    const r2 = i % 2 === 0 ? starInnerRadius : starRadius;

    const p0 = new Vector2(center, center);
    const p1 = new Vector2(center + r1 * Math.cos(angle1), center + r1 * Math.sin(angle1));
    const p2 = new Vector2(center + r2 * Math.cos(angle2), center + r2 * Math.sin(angle2));

    const wedgeShape = new Shape().moveToPoint(p0).lineToPoint(p1).lineToPoint(p2).close();
    starNode.addChild(
      new Path(wedgeShape, {
        fill: fillProperty,
        stroke: fillProperty,
        lineWidth: 0.5,
        pickable: false,
      }),
    );
  }

  // Draw the star outline on top to give a clean, crisp boundary
  const outlineShape = new Shape();
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? starRadius : starInnerRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    if (i === 0) {
      outlineShape.moveTo(x, y);
    } else {
      outlineShape.lineTo(x, y);
    }
  }
  outlineShape.close();

  const outline = new Path(outlineShape, {
    stroke: MazeGameColors.goalMarkerColorProperty,
    lineWidth: starStrokeWidth,
    pickable: false,
  });
  starNode.addChild(outline);

  const specularRadius = Math.max(1, starInnerRadius * MazeGameLayoutConstants.ARENA_GOAL_STAR_SPECULAR_RADIUS_RATIO);
  const specularOffset = new Vector2(
    center - specularRadius * MazeGameLayoutConstants.ARENA_GOAL_STAR_SPECULAR_OFFSET_RATIO,
    center - specularRadius * MazeGameLayoutConstants.ARENA_GOAL_STAR_SPECULAR_OFFSET_RATIO,
  );
  const starSpecularHighlight = new Circle(specularRadius, {
    fill: new RadialGradient(0, 0, 0, 0, 0, specularRadius)
      .addColorStop(0, MazeGameColors.particleSpecularColorProperty)
      .addColorStop(1, TRANSPARENT_COLOR),
    center: specularOffset,
    pickable: false,
  });

  return new Node({
    children: [backdropGlow, ringsGlow, solidRings, dashedRing, starNode, starSpecularHighlight],
    pickable: false,
  });
}

/**
 * Rebuild wall-tile pattern when profile colors change.
 */
export function createWallFill(
  tileSizeView: number,
  wallColorProperty: TReadOnlyProperty<Color>,
  wallShadowColorProperty: TReadOnlyProperty<Color>,
): Pattern {
  return createBrickWallPattern(tileSizeView, toColor(wallColorProperty.value), toColor(wallShadowColorProperty.value));
}

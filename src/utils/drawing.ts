import { Color } from 'color';

export function getLinePoints(p1: Phaser.Math.Vector2, p2: Phaser.Math.Vector2, radius: number): Phaser.Math.Vector2[] {
  const points: Array<Phaser.Math.Vector2> = [p1, p2];
  let delta = p2.clone().subtract(p1);
  const length = delta.length();
  if (length === 0) {
    // console.log('length is 0');
    return points;
  }
  delta = delta.clone().scale(1 / length);
  for (let i = 0; i < length; i += radius) {
    points.push(p1.clone().add(delta.clone().scale(i)));
  }

  // console.log(JSON.stringify(points));

  return points;
}

export function invert_color(color: number): number {
  return 0xffffff - color;
}

export function getReasonableOutlineColor(color: Color): number {
  if (color.r + color.b + color.g > 384) {
    return 0x000000;
  }
  return 0xffffff;
}

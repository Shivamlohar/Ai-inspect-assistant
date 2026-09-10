/**
 * Exponential Moving Average (EMA) Low-Pass Filter for Landmark & Bounding Box Coordinates.
 * Prevents optical sensor jitter in low-light environments from causing false "suspicious movement"
 * or false defect readings.
 */

export interface Point2D {
  x: number;
  y: number;
}

export class JitterFilter {
  private alpha: number; // Smoothing factor between 0.0 (max smooth) and 1.0 (raw)
  private prevPoint: Point2D | null = null;
  private noiseThreshold: number; // Minimal pixel displacement to treat as true movement

  constructor(alpha = 0.75, noiseThreshold = 1.5) {
    this.alpha = alpha;
    this.noiseThreshold = noiseThreshold;
  }

  public filter(point: Point2D, ambientLux?: number): Point2D {
    if (!this.prevPoint) {
      this.prevPoint = { ...point };
      return point;
    }

    // In low-light environments (lux < 45), increase noise tolerance to ignore sensor flickering
    const currentThreshold = (ambientLux !== undefined && ambientLux < 45) 
      ? this.noiseThreshold * 2.2 
      : this.noiseThreshold;

    const dx = Math.abs(point.x - this.prevPoint.x);
    const dy = Math.abs(point.y - this.prevPoint.y);

    // If movement is smaller than sensor noise floor, damp it completely
    if (dx < currentThreshold && dy < currentThreshold) {
      return { ...this.prevPoint };
    }

    // Exponential smoothing
    const smoothedX = this.alpha * point.x + (1 - this.alpha) * this.prevPoint.x;
    const smoothedY = this.alpha * point.y + (1 - this.alpha) * this.prevPoint.y;

    this.prevPoint = { x: smoothedX, y: smoothedY };
    return this.prevPoint;
  }

  public reset() {
    this.prevPoint = null;
  }
}

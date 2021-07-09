import { Point2D, Segment2D, Polygon2D, Ellipse2D, Text2D } from '../scene/item.js';
import log from 'loglevel';

export class OutputOption {

  render(elements, screen) {
    this.initScreen(screen);
    for (let element of elements) {
      if (element instanceof Point2D) this.renderPoint(element);
      else if (element instanceof Segment2D) this.renderSegment(element);
      else if (element instanceof Polygon2D) this.renderPoly(element);
      else if (element instanceof Ellipse2D) this.renderEllipse(element);
      else if (element instanceof Text2D) this.renderText(element);
    }
    this.flushOutput();
  }

  initScreen() {}

  renderPoint(p) {}
  renderSegment(s) {}
  renderPoly(pg) {}
  renderEllipse(e) {}
  renderText(t) {}

  flushOutput() {}
}
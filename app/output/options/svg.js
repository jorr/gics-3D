import { OutputOption } from '../output.js';
import { midpoint } from '../../scene/util.js';
import fs from 'fs';

export class SvgOutput extends OutputOption {

    fileName;
    svg = '';
    stroke = 'black';
    strokeWidth = 1;
    labelOffset = {x: 2, y: 2};
    width;
    height;

    constructor(fileName, width = 1000, height = 1000) {
      super();
      this.fileName = fileName;
      this.width = width;
      this.height = height;
    }

    initScreen(screen) {
      this.strokeWidth = screen.w/this.width;
      this.svg = `<?xml version="1.0" standalone="no"?>
<svg version="1.1" baseProfile="full" width="${this.width}" height="${this.height}" viewBox="0 0 ${screen.w} ${screen.h}" xmlns="http://www.w3.org/2000/svg">
<style>
  text {
    font-size: 60px;
  }

  @media (max-width: 600px) {
    text {
      font-size: 20px;
    }
  }

  @media (max-width: 800px) {
    text {
      font-size: 40px;
    }
  }
</style>
<rect width="100%" height="100%" fill="#eee" />
<g id="scene" transform="translate(${screen.w/2} ${screen.h/2})">`;
    }

    renderPoint(p) {
      this.svg = `${this.svg}
<circle cx="${p.x}" cy="${-p.y}" r="${this.strokeWidth}" stroke="${this.stroke}" stroke-width="${this.strokeWidth}" fill="${this.stroke}"/>`;
      if (p.label) {
        this.svg = `${this.svg}
<text x="${p.x+this.labelOffset.x}" y="${-p.y+this.labelOffset.y}">${p.label}</text>`;
      }
    }

    renderSegment(s) {
      this.svg = `${this.svg}
<line x1="${s.p1.x}" x2="${s.p2.x}" y1="${-s.p1.y}" y2="${-s.p2.y}" stroke="${this.stroke}" stroke-width="${this.strokeWidth}"/>`;
      if (s.label) {
        //TODO: make this smarter
        let midPoint = midpoint(s.p1, s.p2);
        this.svg = `${this.svg}
<text x="${midPoint.x+this.labelOffset.x}" y="${-midPoint.y+this.labelOffset.y}">${s.label}</text>`;
      }
    }

    renderPoly(pg) {
      let points = pg.points.map(p => `${p.x},${-p.y}`).join(' ');
      this.svg = `${this.svg}
<polygon points="${points}" stroke="${this.stroke}" stroke-width="${this.strokeWidth}" fill="none"/>`;
      if (pg.label) {
        //TODO: make this smarter
        this.svg = `${this.svg}
<text x="${pg.points[0].x+this.labelOffset.x}" y="${-pg.points[0].y+this.labelOffset.y}">${pg.label}</text>`;
      }
    }

    renderEllipse(e) {
      this.svg = `${this.svg}
<ellipse cx="${e.c.x}" cy="${-e.c.y}" rx="${e.rx}" ry="${e.ry}" transform="rotate(${e.rotate})" stroke="${this.stroke}" stroke-width="${this.strokeWidth}"/>`;
      if (e.label) {
        this.svg = `${this.svg}
<text x="${e.c.x}" y="${-e.c.y + e.ry + this.labelOffset.y}">${e.label}</text>`;
      }
    }

    flushOutput() {
      this.svg = `${this.svg}
</g>
</svg>`;
      fs.writeFileSync(this.fileName, this.svg, 'utf-8');
    }
}
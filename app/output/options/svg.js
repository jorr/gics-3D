import { OutputOption } from '../output.js';
import { midpoint } from '../../scene/util.js';
import fs from 'fs';

import log from 'loglevel';

export class SvgOutput extends OutputOption {

    fileName;
    svg = '';
    stroke = 'black';
    strokeWidth = 1;
    labelOffset = {x: 4, y: 4};
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
      this.labelOffset = {
        x: screen.w/this.width * 4,
        y: screen.w/this.width * 4
      };
      this.svg = `<?xml version="1.0" standalone="no"?>
<svg version="1.1" baseProfile="full" width="${this.width}" height="${this.height}" viewBox="0 0 ${screen.w} ${screen.h}" xmlns="http://www.w3.org/2000/svg">
<style>
  text {
    font-size: ${screen.w/100+5}px;
  }

  @media (max-width: 600px) {
    text {
      font-size: ${screen.w/30+5}px;
    }
  }

  @media (max-width: 800px) {
    text {
      font-size: ${screen.w/15+5}px;
    }
  }
</style>
<rect width="100%" height="100%" fill="#eee" />
<g id="scene" transform="translate(${screen.w/2} ${screen.h/2})">`;
    }

    renderPoint(p) {
      this.svg = `${this.svg}
<circle cx="${p.x}" cy="${-p.y}" r="${this.strokeWidth}" stroke="${p.color || this.stroke}" stroke-width="${this.strokeWidth}" fill="${this.stroke}"/>`;
      this.renderLabel(p.label, p);
    }

    renderSegment(s) {
      this.svg = `${this.svg}
<line x1="${s.p1.x}" x2="${s.p2.x}" y1="${-s.p1.y}" y2="${-s.p2.y}" stroke="${s.color || this.stroke}" stroke-width="${this.strokeWidth + Number(s.drawAsArrow)}"/>`;
      this.renderLabel(s.label, midpoint(s.p1, s.p2));

      if (s.drawAsArrow) {
        this.renderPoint(s.p1);
        this.renderArrow(s);
      }
    }

    renderPoly(pg) {
      let points = pg.points.map(p => `${p.x},${-p.y}`).join(' ');
      this.svg = `${this.svg}
<polygon points="${points}" stroke="${this.stroke}" stroke-width="${this.strokeWidth}" fill="${pg.color || 'none'}"/>`;
      this.renderLabel(pg.label, pg.centre);
    }

    renderEllipse(e) {
      log.debug(e)
      this.svg = `${this.svg}
<ellipse cx="${e.c.x}" cy="${-e.c.y}" rx="${e.rx}" ry="${e.ry}" transform="rotate(${e.rotate},${e.c.x},${-e.c.y})" stroke="${this.stroke}" stroke-width="${this.strokeWidth}" fill="none"/>`;
      this.renderLabel(e.label, e.c);
    }

    renderArrow(s) {
      let vectorOnSegment = { x: (s.p1.x-s.p2.x) * 0.1, y: (s.p1.y-s.p2.y) * 0.1};
      let angle = 30 * Math.PI / 180;
      this.renderPoly({
        color: 'black',
        points: [
          s.p2,
          //rotate point on segment both ways
          {
            x: s.p2.x + vectorOnSegment.x*Math.cos(angle) - vectorOnSegment.y*Math.sin(angle),
            y: s.p2.y + vectorOnSegment.x*Math.sin(angle) + vectorOnSegment.y*Math.cos(angle)
          },
          {
            x: s.p2.x + vectorOnSegment.x*Math.cos(-angle) - vectorOnSegment.y*Math.sin(-angle),
            y: s.p2.y + vectorOnSegment.x*Math.sin(-angle) + vectorOnSegment.y*Math.cos(-angle)
          }
        ]
      });
    }

    renderLabel(label, location, preset) {
      if (!label) return;
      preset = preset || 'SE';
      let displacement = { x:0, y:0 };
      for (let dir of preset) {
        switch(dir) {
          case 'N': displacement.y = displacement.y - this.labelOffset.y; break;
          case 'S': displacement.y = displacement.y + this.labelOffset.y; break;
          case 'E': displacement.x = displacement.x + this.labelOffset.x; break;
          case 'W': displacement.x = displacement.x - this.labelOffset.x; break;
        }
      }

      this.svg = `${this.svg}
<text x="${location.x+displacement.x}" y="${-location.y+displacement.y}">${label}</text>`;
    }

    flushOutput() {
      this.svg = `${this.svg}
</g>
</svg>`;
      fs.writeFileSync(this.fileName, this.svg, 'utf-8');
    }
}
import { OutputOption } from '../output.js';
// import { midpoint } from '../../scene/util.js';
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

    parseLinetype(style) {
      switch (style.linetype) {
        case 'dashed': return 'stroke-dasharray="4 2"'; break;
        case 'dotted': return 'stroke-dasharray="1 6" stroke-linecap="round"'; break;
        case 'altern': return 'stroke-dasharray="4 2 1 2" stroke-linecap="round"'; break;
        case 'solid':
        default: return '';
      }
    }

    parseStyle(style) {
      return {
        strokeWidth: style.stroke || this.strokeWidth,
        color: style.color || this.stroke,
        linetype: this.parseLinetype(style),
      }
    }

    renderPoint(p) {
      let st = this.parseStyle(p.style);
      this.svg = `${this.svg}
<circle cx="${p.x}" cy="${-p.y}" r="${st.strokeWidth}" stroke="${st.color}" stroke-width="${st.strokeWidth}" fill="${st.color}"/>`;
    }

    renderSegment(s) {
      let st = this.parseStyle(s.style);
      this.svg = `${this.svg}
<line x1="${s.p1.x}" x2="${s.p2.x}" y1="${-s.p1.y}" y2="${-s.p2.y}" ${st.linetype} stroke="${st.color}" stroke-width="${st.strokeWidth + Number(s.drawAsArrow)}"/>`;
      if (s.drawAsArrow) {
        this.renderPoint(Object.assign(s.p1, {style: s.style}));
        this.renderArrow(s, st.color);
      }
    }

    renderPoly(pg) {
      let st = this.parseStyle(pg.style);
      let points = pg.points.map(p => `${p.x},${-p.y}`).join(' ');
      this.svg = `${this.svg}
<polygon points="${points}" stroke="${st.color}" ${st.linetype} stroke-width="${st.strokeWidth}" fill="${pg.fillColor || 'none'}"/>`;
    }

    renderEllipse(e) {
      log.debug(e)
      let st = this.parseStyle(e.style);
      this.svg = `${this.svg}
<ellipse cx="${e.c.x}" cy="${-e.c.y}" rx="${e.rx}" ry="${e.ry}" transform="rotate(${e.rotate},${e.c.x},${-e.c.y})" ${st.linetype} stroke="${st.stroke}" stroke-width="${st.strokeWidth}" fill="none"/>`;
    }

    renderArrow(s,color) {
      let vectorOnSegment = { x: (s.p1.x-s.p2.x) * 0.1, y: (s.p1.y-s.p2.y) * 0.1};
      let angle = 30 * Math.PI / 180;
      this.renderPoly({
        color: color,
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

    renderText(t) {
      if (!t.text || !t.location) return;

      //TODO: parse special text here
      let preset = t.direction || 'SE';
      let offset = t.offset ? {x: 0, y:0} : this.labelOffset;
      for (let dir of preset) {
        switch(dir) {
          case 'N': offset.y = offset.y - t.offset; break;
          case 'S': offset.y = offset.y + t.offset; break;
          case 'E': offset.x = offset.x + t.offset; break;
          case 'W': offset.x = offset.x - t.offset; break;
        }
      }

      this.svg = `${this.svg}
<text x="${t.location.x+offset.x}" y="${-t.location.y+offset.y}">${t.text}</text>`;
    }

    flushOutput() {
      this.svg = `${this.svg}
</g>
</svg>`;
      fs.writeFileSync(this.fileName, this.svg, 'utf-8');
    }
}
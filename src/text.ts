import { createEle, CTX } from './globals';

const canvas = createEle('canvas') as HTMLCanvasElement;

export const makeTextTex = (text: string, size: number) => {
  const ctx2d = canvas.getContext('2d');
  canvas.width  = size;
  canvas.height = size;
  ctx2d.font = '100px monospace';
  ctx2d.textAlign = 'center';
  ctx2d.textBaseline = 'middle';
  ctx2d.fillStyle = 'white';
  ctx2d.clearRect(0, 0, size, size);
  ctx2d.fillText(text, size / 2, size / 2);
  return CTX.texture_().setTexImage2D_(canvas).setWrap_().setFilter_();
  // .setFilter_(GL_LINEAR);
}

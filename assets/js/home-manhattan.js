/* Decorative, seeded GWAS simulation; no SNP identifiers or results are real. */
(() => {
  const host = document.querySelector('.hero-manhattan');
  const canvas = host?.querySelector('canvas');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  // Human GRCh38 autosomes, UCSC hg38.chrom.sizes (base pairs):
  // https://hgdownload.soe.ucsc.edu/goldenPath/hg38/bigZips/hg38.chrom.sizes
  const lengths = [248956422,242193529,198295559,190214555,181538259,
    170805979,159345973,145138636,138394717,133797422,135086622,
    133275309,114364328,107043718,101991189,90338345,83257441,
    80373285,58617616,64444167,46709983,50818468];
  const total = lengths.reduce((sum, length) => sum + length, 0);
  const offsets = lengths.map((_, i) => lengths.slice(0, i).reduce((a, b) => a + b, 0));
  let seed = 20261028;
  const random = () => {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const gaussian = () => Math.sqrt(-2 * Math.log(Math.max(random(), 1e-9))) * Math.cos(2 * Math.PI * random());
  const points = [];
  const add = (chr, pos, y, lead = false) => points.push({chr, pos: Math.round(pos), y, lead});
  // Most markers form a low, dense field; spacing between chromosomes stays visible.
  for (let i = 0; i < 4900; i++) {
    const genomePos = random() * total;
    let chr = lengths.findIndex((length, index) => genomePos < offsets[index] + length);
    const y = Math.min(3.9, .04 - Math.log(Math.max(random(), 1e-9)) * .82);
    add(chr, genomePos - offsets[chr], y);
  }
  // [chromosome, relative location, lead -log10(P), regional span].
  // Uneven genomic locations, with two short central peaks below the threshold.
  const peaks = [[2,.65,11.6,3100000],[4,.4,14.2,2500000],[6,.65,8.8,2700000],
    [8,.65,5.3,2400000],[10,.45,4.8,2300000],[14,.6,10.4,2300000],
    [17,.45,13.2,1900000],[21,.5,9.4,1500000]];
  for (const [chromosome, relative, height, regionalScale] of peaks) {
    // Widen the illustrative LD envelope enough to remain legible as a background.
    const span = regionalScale * 15;
    const chr = chromosome - 1;
    const center = lengths[chr] * relative;
    for (let i = 0; i < 199; i++) {
      const tip = i < 12;
      const distance = tip
        ? (random() - .5) * span * .025 * (i + 1) / 12
        : Math.max(-span, Math.min(span, gaussian() * span * .32));
      const envelope = Math.exp(-Math.abs(distance) / (span * .2));
      const y = tip
        ? height - .12 - i * .105 - random() * .08
        : .5 + (height - .5) * envelope * (.3 + .68 * random());
      add(chr, center + distance, y);
    }
    add(chr, center, height, true);
  }

  let resizeFrame = 0, colors;
  const appearance = matchMedia('(prefers-color-scheme: dark)');
  const paintPoint = (point) => {
    ctx.globalAlpha = point.alpha;
    ctx.fillStyle = point.lead ? colors.lead : colors.blues[point.chr % 2];
    ctx.beginPath();
    ctx.arc(point.x, point.screenY, point.radius, 0, Math.PI * 2);
    ctx.fill();
  };
  const render = () => {
    const rect = host.getBoundingClientRect();
    const {width, height} = rect;
    if (!width || !height) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const dark = document.documentElement.dataset.theme === 'dark';
    colors = dark
      ? {blues:['#8BA9E4','#6BA8FF'],lead:'#E9A358',axis:'#7893B8',threshold:'#9FB4D5'}
      : {blues:['#163073','#286AE2'],lead:'#DE7A12',axis:'#7789A4',threshold:'#6B87B4'};
    const margin = width < 700 ? 12 : 24;
    const gap = width < 700 ? 2 : 4;
    const plotWidth = width - margin * 2 - gap * 21;
    const bottom = height - 26, plotHeight = bottom - 14;
    const projectX = (chr, pos) => margin + gap * chr + (offsets[chr] + pos) / total * plotWidth;
    const projectY = y => bottom - y / 16 * plotHeight;
    ctx.clearRect(0, 0, width, height);
    // The guide and baseline are deliberately very light and unlabelled.
    ctx.strokeStyle = colors.threshold; ctx.globalAlpha = .25; ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.moveTo(margin, projectY(7.30103)); ctx.lineTo(width - margin, projectY(7.30103)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = colors.axis; ctx.globalAlpha = .19; ctx.lineWidth = .65;
    ctx.beginPath(); ctx.moveTo(margin, bottom + .5); ctx.lineTo(width - margin, bottom + .5); ctx.stroke();
    ctx.font = `400 ${width < 700 ? 10 : 11}px Inter, -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.fillStyle = colors.axis; ctx.globalAlpha = dark ? .65 : .7;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    lengths.forEach((length, chr) => {
      if (width >= 900 || chr % 2 === 0) ctx.fillText(String(chr + 1), projectX(chr, length / 2), bottom + 15);
    });
    const rendered = points.filter((point, i) => width >= 900 || i % 2 === 0 || point.lead).map(point => ({
      ...point, x: projectX(point.chr, point.pos), screenY: projectY(point.y),
      radius: point.lead ? 3.6 : point.y > 7.3 ? 2.7 : point.y > 4 ? 1.9 : 1.6,
      alpha: point.lead ? .95 : point.y > 7.3 ? .7 : point.y > 4 ? .42 : .27,
    }));
    // Paint leads last so their warm accent stays crisp above the point field.
    for (const point of rendered.filter(point => !point.lead)) paintPoint(point);
    for (const point of rendered.filter(point => point.lead)) paintPoint(point);
  };
  const scheduleResize = () => {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => { resizeFrame = 0; render(); });
  };
  window.addEventListener('resize', scheduleResize, {passive:true});
  new ResizeObserver(scheduleResize).observe(host);
  appearance.addEventListener('change', scheduleResize);
  render();
})();

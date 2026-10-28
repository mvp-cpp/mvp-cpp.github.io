(() => {
  const selector = document.querySelector('[data-build-selector]');
  if (!selector) return;

  // These are the targets presented by the existing download page. Replace
  // pending links with verified release assets before enabling downloads.
  const targets = {
    linux: { label: 'Linux', architectures: ['x86_64'] },
    macos: { label: 'macOS', architectures: ['arm64', 'x86_64'] },
    windows: { label: 'Windows', architectures: ['x86_64'] }
  };
  const controls = [...selector.querySelectorAll('input[type="radio"]')];
  const selected = name => selector.querySelector(`input[name="${name}"]:checked`).value;
  const support = selector.querySelector('[data-compute-support]');
  const requirement = selector.querySelector('[data-requirement]');
  const output = selector.querySelector('[data-selected-package]');
  const platformIcon = selector.querySelector('[data-platform-icon]');

  function update() {
    const gpu = selected('mvp-build') === 'gpu';
    const operatingSystems = controls.filter(input => input.name === 'mvp-os');
    operatingSystems.forEach(input => {
      input.disabled = gpu && input.value !== 'linux';
    });
    if (selector.querySelector('input[name="mvp-os"]:checked').disabled) {
      selector.querySelector('input[name="mvp-os"][value="linux"]').checked = true;
    }

    const os = selected('mvp-os');
    const target = targets[os];
    platformIcon.textContent = { linux: 'LIN', macos: 'MAC', windows: 'WIN' }[os];
    const architectures = controls.filter(input => input.name === 'mvp-architecture');
    architectures.forEach(input => {
      input.disabled = !target.architectures.includes(input.value);
    });
    if (selector.querySelector('input[name="mvp-architecture"]:checked').disabled) {
      architectures.find(input => input.value === target.architectures[0]).checked = true;
    }

    support.textContent = gpu ? 'CPU + NVIDIA CUDA' : 'CPU only';
    requirement.hidden = !gpu;
    requirement.textContent = gpu
      ? 'Requires a compatible NVIDIA GPU, driver and CUDA runtime.'
      : '';
    const architecture = selected('mvp-architecture');
    const architectureLabel = os === 'macos'
      ? (architecture === 'arm64' ? 'Apple Silicon · arm64' : 'Intel · x86_64')
      : architecture;
    output.textContent = `${gpu ? 'GPU-enabled full build' : 'CPU-only build'} · ${target.label} · ${architectureLabel}`;
  }

  controls.forEach(input => input.addEventListener('change', update));
  update();
})();

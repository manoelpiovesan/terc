(() => {
  const loading = document.getElementById('scene-loading');
  const errorBox = document.getElementById('scene-error');
  const canvasHost = document.getElementById('scene-wrap');
  if (!window.THREE || !THREE.OrbitControls) {
    loading.hidden = true;
    errorBox.hidden = false;
    return;
  }

  const colors = {
    blue: 0x6d9cff,
    cyan: 0x63d9f2,
    green: 0x4ee0b3,
    orange: 0xffb35c,
    purple: 0xb6a1ff,
    red: 0xff7188,
    ink: 0x0a1321
  };

  const nodeData = [
    { id: 'internet', title: 'Internet', subtitle: 'WAN · 1 Gb/s', type: 'Nuvem / WAN', ip: 'Rede pública', role: 'Ponto de entrada e saída da rede corporativa.', links: 'Cisco ISR 8200', tags: ['infra', 'routes'], shape: 'cloud', color: colors.cyan, pos: [0, 0, -14] },
    { id: 'router', title: 'Roteador de borda', subtitle: 'Cisco ISR 8200', type: 'Roteador', ip: 'WAN: 1 Gb/s · LAN: 10.0.1.0/24', role: 'Encaminha o tráfego entre a rede corporativa e a operadora. A rota padrão indicada aponta para 10.0.1.1.', links: 'Internet · FortiGate 60F', tags: ['infra', 'routes'], shape: 'router', color: colors.blue, pos: [0, 0, -10] },
    { id: 'firewall', title: 'Firewall', subtitle: 'FortiGate 60F', type: 'Firewall / L3', ip: '10.0.1.1/24', role: 'Aplica políticas de segurança e controle de tráfego entre os segmentos e a borda.', links: 'ISR 8200 · Switch Core', tags: ['infra', 'routes'], shape: 'firewall', color: colors.red, pos: [0, 0, -6] },
    { id: 'core', title: 'Switch Core', subtitle: 'Cisco Catalyst 9300-24T', type: 'Switch de núcleo', ip: 'Conecta a borda, servidores e switches de acesso.', role: 'Concentra os enlaces da rede e distribui as VLANs para a camada de acesso e para os servidores.', links: 'FortiGate · VLAN 50 · Switches de acesso 1 e 2', tags: ['infra', 'segments', 'routes'], shape: 'core', color: colors.cyan, pos: [0, 0, -2] },
    { id: 'servers', title: 'Servidores', subtitle: 'VLAN 50 · aplicações', type: 'Rede de servidores', ip: '10.0.50.0/24', role: 'Hospeda servidores, aplicações e serviços internos. O acesso deve ser controlado por políticas.', links: 'Switch Core · VLAN 50', tags: ['infra', 'segments'], shape: 'server', color: colors.orange, pos: [8, 0, -2] },
    { id: 'sw1', title: 'Switch de Acesso 1', subtitle: 'Cisco Catalyst 9200L-24P-4G', type: 'Switch de acesso / PoE', ip: 'Rede intermediária: 10.0.10.0/24', role: 'Conecta os APs 1 e 2. PoE pode fornecer dados e alimentação pelo mesmo cabo.', links: 'Switch Core via fibra · AP 1 · AP 2', tags: ['infra', 'segments', 'routes'], shape: 'switch', color: colors.green, pos: [-5, 0, 3] },
    { id: 'sw2', title: 'Switch de Acesso 2', subtitle: 'Cisco Catalyst 9200L-24P-4G', type: 'Switch de acesso / PoE', ip: 'Rede intermediária: 10.0.10.0/24', role: 'Conecta os APs 3 e 4. PoE pode fornecer dados e alimentação pelo mesmo cabo.', links: 'Switch Core via fibra · AP 3 · AP 4', tags: ['infra', 'segments', 'routes'], shape: 'switch', color: colors.green, pos: [5, 0, 3] },
    { id: 'ap1', title: 'Ponto de Acesso 1', subtitle: 'AP 1 · Wi-Fi 1', type: 'Access Point', ip: '10.0.10.1/24', role: 'Atende clientes da rede Wi-Fi 1 e é o próximo salto indicado para essa rede.', links: 'Switch de Acesso 1 · 192.168.10.0/24', tags: ['infra', 'segments', 'routes'], shape: 'ap', color: colors.purple, pos: [-9, 0, 8] },
    { id: 'ap2', title: 'Ponto de Acesso 2', subtitle: 'AP 2 · Wi-Fi 2', type: 'Access Point', ip: '10.0.10.2/24', role: 'Atende clientes da rede Wi-Fi 2 e é o próximo salto indicado para essa rede.', links: 'Switch de Acesso 1 · 192.168.20.0/24', tags: ['infra', 'segments', 'routes'], shape: 'ap', color: colors.purple, pos: [-3, 0, 8] },
    { id: 'ap3', title: 'Ponto de Acesso 3', subtitle: 'AP 3 · Wi-Fi 3', type: 'Access Point', ip: '10.0.10.3/24', role: 'Atende clientes da rede Wi-Fi 3 e é o próximo salto indicado para essa rede.', links: 'Switch de Acesso 2 · 192.168.30.0/24', tags: ['infra', 'segments', 'routes'], shape: 'ap', color: colors.purple, pos: [3, 0, 8] },
    { id: 'ap4', title: 'Ponto de Acesso 4', subtitle: 'AP 4 · Wi-Fi 4', type: 'Access Point', ip: '10.0.10.4/24', role: 'Atende clientes da rede Wi-Fi 4 e é o próximo salto indicado para essa rede.', links: 'Switch de Acesso 2 · 192.168.40.0/24', tags: ['infra', 'segments', 'routes'], shape: 'ap', color: colors.purple, pos: [9, 0, 8] },
    { id: 'wifi1', title: 'Sub-rede Wi-Fi 1', subtitle: 'DHCP · clientes', type: 'Rede de clientes', ip: '192.168.10.0/24', role: 'Endereços dos clientes Wi-Fi associados ao AP 1. Próximo salto: 10.0.10.1.', links: 'AP 1 · Internet via rede corporativa', tags: ['segments', 'routes'], shape: 'wifi', color: colors.cyan, pos: [-9, 0, 13] },
    { id: 'wifi2', title: 'Sub-rede Wi-Fi 2', subtitle: 'DHCP · clientes', type: 'Rede de clientes', ip: '192.168.20.0/24', role: 'Endereços dos clientes Wi-Fi associados ao AP 2. Próximo salto: 10.0.10.2.', links: 'AP 2 · Internet via rede corporativa', tags: ['segments', 'routes'], shape: 'wifi', color: colors.cyan, pos: [-3, 0, 13] },
    { id: 'wifi3', title: 'Sub-rede Wi-Fi 3', subtitle: 'DHCP · clientes', type: 'Rede de clientes', ip: '192.168.30.0/24', role: 'Endereços dos clientes Wi-Fi associados ao AP 3. Próximo salto: 10.0.10.3.', links: 'AP 3 · Internet via rede corporativa', tags: ['segments', 'routes'], shape: 'wifi', color: colors.cyan, pos: [3, 0, 13] },
    { id: 'wifi4', title: 'Sub-rede Wi-Fi 4', subtitle: 'DHCP · clientes', type: 'Rede de clientes', ip: '192.168.40.0/24', role: 'Endereços dos clientes Wi-Fi associados ao AP 4. Próximo salto: 10.0.10.4.', links: 'AP 4 · Internet via rede corporativa', tags: ['segments', 'routes'], shape: 'wifi', color: colors.cyan, pos: [9, 0, 13] }
  ];

  const byId = Object.fromEntries(nodeData.map(item => [item.id, item]));
  const connections = [
    ['internet', 'router', 'ethernet', 'WAN 1 Gb/s'],
    ['router', 'firewall', 'ethernet', '10.0.1.0/24'],
    ['firewall', 'core', 'ethernet', 'Uplink'],
    ['core', 'servers', 'ethernet', 'VLAN 50'],
    ['core', 'sw1', 'fiber', 'Fibra SFP+ 10 Gb/s'],
    ['core', 'sw2', 'fiber', 'Fibra SFP+ 10 Gb/s'],
    ['sw1', 'ap1', 'poe', 'PoE'], ['sw1', 'ap2', 'poe', 'PoE'],
    ['sw2', 'ap3', 'poe', 'PoE'], ['sw2', 'ap4', 'poe', 'PoE'],
    ['ap1', 'wifi1', 'wifi', 'Wi-Fi 1'], ['ap2', 'wifi2', 'wifi', 'Wi-Fi 2'],
    ['ap3', 'wifi3', 'wifi', 'Wi-Fi 3'], ['ap4', 'wifi4', 'wifi', 'Wi-Fi 4']
  ];

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(colors.ink);
  scene.fog = new THREE.Fog(colors.ink, 38, 78);

  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 120);
  camera.position.set(18, 17, 29);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(colors.ink, 1);
  renderer.outputEncoding = THREE.sRGBEncoding;
  canvasHost.insertBefore(renderer.domElement, canvasHost.firstChild);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.minDistance = 16;
  controls.maxDistance = 58;
  controls.maxPolarAngle = Math.PI * 0.49;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x8c8576, 1.25));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.35);
  keyLight.position.set(8, 22, 13);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(0x398cff, 0.7, 55);
  rimLight.position.set(-15, 9, -7);
  scene.add(rimLight);

  const grid = new THREE.GridHelper(48, 48, 0x294666, 0x1b3048);
  grid.position.y = -1.7;
  grid.material.transparent = true;
  grid.material.opacity = 0.48;
  scene.add(grid);

  const nodeGroups = {};
  const pickables = [];
  const edgeObjects = [];
  const defaultMaterials = [];
  const selectionRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.35, 0.045, 8, 48),
    new THREE.MeshBasicMaterial({ color: colors.cyan, transparent: true, opacity: 0.92 })
  );
  selectionRing.rotation.x = Math.PI / 2;
  selectionRing.visible = false;
  scene.add(selectionRing);

  function standard(color, roughness = 0.48, metalness = 0.18) {
    return new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive: color, emissiveIntensity: 0.08 });
  }

  function addMesh(group, geometry, material, position, scale) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position[0], position[1], position[2]);
    if (scale) mesh.scale.set(scale[0], scale[1], scale[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.nodeId = group.userData.node.id;
    group.add(mesh);
    pickables.push(mesh);
    defaultMaterials.push({ material, opacity: material.opacity === undefined ? 1 : material.opacity });
    return mesh;
  }

  function addPorts(group, xStart, count, z = 0.57) {
    for (let i = 0; i < count; i++) {
      const light = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.035), standard(i % 3 === 0 ? colors.green : 0x6d88aa, 0.3, 0.05));
      light.position.set(xStart + i * 0.27, -0.12, z);
      light.userData.nodeId = group.userData.node.id;
      group.add(light);
      pickables.push(light);
    }
  }

  function makeLabel(data) {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    const r = 22;
    ctx.fillStyle = '#fffdf6';
    ctx.strokeStyle = '#171717';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(r, 3); ctx.lineTo(canvas.width-r, 3); ctx.quadraticCurveTo(canvas.width-3, 3, canvas.width-3, r);
    ctx.lineTo(canvas.width-3, canvas.height-r); ctx.quadraticCurveTo(canvas.width-3, canvas.height-3, canvas.width-r, canvas.height-3);
    ctx.lineTo(r, canvas.height-3); ctx.quadraticCurveTo(3, canvas.height-3, 3, canvas.height-r);
    ctx.lineTo(3, r); ctx.quadraticCurveTo(3, 3, r, 3); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#171717';
    ctx.font = '700 31px Manrope, Arial, sans-serif';
    let title = data.title;
    if (ctx.measureText(title).width > 550) title = title.slice(0, 28) + '…';
    ctx.fillText(title, canvas.width/2, 61);
    ctx.fillStyle = '#2454de';
    ctx.font = '23px "DM Mono", Consolas, monospace';
    const subtitle = data.subtitle.length > 37 ? data.subtitle.slice(0, 35) + '…' : data.subtitle;
    ctx.fillText(subtitle, canvas.width/2, 105);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, opacity: 0.98 });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(4.0, 1.0, 1);
    sprite.position.set(0, 1.45, 0);
    sprite.userData.nodeId = data.id;
    return sprite;
  }

  function buildNode(data) {
    const group = new THREE.Group();
    group.position.set(data.pos[0], data.pos[1], data.pos[2]);
    group.userData.node = data;
    nodeGroups[data.id] = group;
    const body = standard(data.color);
    const dark = standard(0x14243a, 0.34, 0.28);
    const glow = new THREE.MeshBasicMaterial({ color: data.color, transparent: true, opacity: 0.62 });

    if (data.shape === 'cloud') {
      addMesh(group, new THREE.IcosahedronGeometry(0.92, 1), body, [0, 0.15, 0]);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.12, 0.028, 6, 48), glow);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.34;
      ring.userData.nodeId = data.id; group.add(ring); pickables.push(ring);
    } else if (data.shape === 'router') {
      addMesh(group, new THREE.BoxGeometry(2.2, 0.66, 1.05), body, [0, 0.05, 0]);
      addMesh(group, new THREE.BoxGeometry(1.5, 0.12, 0.08), dark, [0, -0.15, 0.56]);
      addPorts(group, -0.64, 5, 0.62);
      for (const side of [-1, 1]) {
        const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.0, 8), dark);
        antenna.position.set(side * 0.78, 0.48, -0.28);
        antenna.rotation.z = side * -0.18;
        antenna.userData.nodeId = data.id; group.add(antenna); pickables.push(antenna);
      }
    } else if (data.shape === 'firewall') {
      addMesh(group, new THREE.BoxGeometry(2.15, 0.9, 1.12), body, [0, 0.08, 0]);
      addMesh(group, new THREE.BoxGeometry(1.55, 0.12, 0.06), dark, [0, -0.1, 0.58]);
      addPorts(group, -0.66, 5, 0.63);
      const shield = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 0), new THREE.MeshBasicMaterial({ color: 0xffe5eb }));
      shield.position.set(0, 0.16, 0.64); shield.userData.nodeId = data.id; group.add(shield); pickables.push(shield);
    } else if (data.shape === 'core') {
      addMesh(group, new THREE.BoxGeometry(3.5, 0.72, 1.42), body, [0, 0.02, 0]);
      addMesh(group, new THREE.BoxGeometry(2.9, 0.14, 0.06), dark, [0, -0.13, 0.75]);
      addPorts(group, -1.28, 10, 0.8);
    } else if (data.shape === 'switch') {
      addMesh(group, new THREE.BoxGeometry(2.85, 0.57, 1.08), body, [0, 0, 0]);
      addMesh(group, new THREE.BoxGeometry(2.35, 0.1, 0.06), dark, [0, -0.13, 0.57]);
      addPorts(group, -1.02, 8, 0.62);
    } else if (data.shape === 'server') {
      for (let i = 0; i < 3; i++) {
        addMesh(group, new THREE.BoxGeometry(0.78, 1.0, 0.72), body, [-0.93 + i * 0.93, 0.32, 0]);
        addMesh(group, new THREE.BoxGeometry(0.48, 0.1, 0.05), dark, [-0.93 + i * 0.93, 0.47, 0.38]);
        const led = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), new THREE.MeshBasicMaterial({ color: colors.green }));
        led.position.set(-1.12 + i * 0.93, 0.19, 0.42); led.userData.nodeId = data.id; group.add(led); pickables.push(led);
      }
    } else if (data.shape === 'ap') {
      addMesh(group, new THREE.CylinderGeometry(0.76, 0.86, 0.3, 32), body, [0, 0.05, 0]);
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.025, 6, 36), glow);
      halo.rotation.x = Math.PI / 2; halo.position.y = -0.12; halo.userData.nodeId = data.id; group.add(halo); pickables.push(halo);
      addMesh(group, new THREE.SphereGeometry(0.11, 12, 10), new THREE.MeshBasicMaterial({ color: 0xf2fbff }), [0, 0.22, 0]);
    } else if (data.shape === 'wifi') {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.12, 40), new THREE.MeshStandardMaterial({ color: 0x18334a, roughness: 0.6, metalness: 0.1 }));
      pad.position.y = -0.16; pad.userData.nodeId = data.id; group.add(pad); pickables.push(pad);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.045, 8, 36), glow);
      ring.rotation.x = Math.PI / 2; ring.position.y = -0.07; ring.userData.nodeId = data.id; group.add(ring); pickables.push(ring);
      for (let i = 0; i < 3; i++) {
        const screen = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.44, 0.12), standard(i === 1 ? 0x9bdcff : 0x789ab9, 0.28, 0.28));
        screen.position.set((i - 1) * 0.48, 0.22, 0.14);
        screen.userData.nodeId = data.id; group.add(screen); pickables.push(screen);
        const stand = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.13, 0.14), dark);
        stand.position.set((i - 1) * 0.48, -0.07, 0.14);
        stand.userData.nodeId = data.id; group.add(stand); pickables.push(stand);
      }
    }

    const label = makeLabel(data);
    group.add(label);
    pickables.push(label);
    scene.add(group);
    return group;
  }

  nodeData.forEach(buildNode);

  function materialForConnection(type) {
    if (type === 'fiber') return new THREE.LineDashedMaterial({ color: colors.orange, dashSize: 0.38, gapSize: 0.18, linewidth: 2, transparent: true, opacity: 0.92 });
    if (type === 'poe') return new THREE.LineDashedMaterial({ color: colors.purple, dashSize: 0.22, gapSize: 0.14, linewidth: 2, transparent: true, opacity: 0.82 });
    if (type === 'wifi') return new THREE.LineDashedMaterial({ color: colors.green, dashSize: 0.2, gapSize: 0.18, linewidth: 2, transparent: true, opacity: 0.72 });
    return new THREE.LineBasicMaterial({ color: colors.blue, transparent: true, opacity: 0.78 });
  }

  function addConnection(sourceId, targetId, type, label) {
    const start = new THREE.Vector3(...byId[sourceId].pos).add(new THREE.Vector3(0, 0.05, 0));
    const end = new THREE.Vector3(...byId[targetId].pos).add(new THREE.Vector3(0, 0.05, 0));
    const direction = end.clone().sub(start);
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const line = new THREE.Line(lineGeometry, materialForConnection(type));
    if (line.computeLineDistances) line.computeLineDistances();
    line.userData.connection = { sourceId, targetId, type, label };
    scene.add(line);

    const arrowMaterial = new THREE.MeshBasicMaterial({ color: type === 'fiber' ? colors.orange : type === 'wifi' ? colors.green : type === 'poe' ? colors.purple : colors.blue, transparent: true, opacity: 0.95 });
    const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.42, 10), arrowMaterial);
    arrow.position.copy(start.clone().add(direction.clone().multiplyScalar(0.86)));
    arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    scene.add(arrow);

    edgeObjects.push({ line, arrow, type, sourceId, targetId });
  }
  connections.forEach(item => addConnection(...item));

  const particle = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 18, 14),
    new THREE.MeshBasicMaterial({ color: 0xffd477 })
  );
  particle.visible = false;
  scene.add(particle);

  function resize() {
    const rect = canvasHost.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width, rect.height, false);
  }
  window.addEventListener('resize', resize);
  resize();
  controls.update();
  loading.hidden = true;

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let downPoint = null;
  let selectedId = null;
  let activeView = 'all';
  const panelTitle = document.getElementById('panelTitle');
  const panelEyebrow = document.getElementById('panelEyebrow');
  const panelIntro = document.getElementById('panelIntro');
  const panelContent = document.getElementById('panelContent');
  const panelIcon = document.getElementById('panelIcon');

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }

  function card(label, value) {
    return `<div class="info-card"><p class="info-label">${label}</p><p class="info-value">${value}</p></div>`;
  }

  function displayNode(data) {
    selectedId = data.id;
    selectionRing.visible = true;
    selectionRing.position.set(data.pos[0], -0.58, data.pos[2]);
    selectionRing.scale.setScalar(data.shape === 'core' || data.shape === 'server' ? 1.25 : 1);
    panelEyebrow.textContent = data.type.toUpperCase();
    panelTitle.textContent = data.title;
    panelIntro.textContent = data.role;
    panelIcon.textContent = ({ cloud: '◎', router: '⇄', firewall: '⬡', core: '▤', switch: '▤', server: '▥', ap: '◉', wifi: '⌁' })[data.shape] || '⌘';
    panelContent.innerHTML = card('Endereço / identificação', escapeHtml(data.ip)) +
      card('Conexões', escapeHtml(data.links)) +
      `<div class="tag-row">${data.tags.map(tag => `<span class="tag">${escapeHtml(tag === 'infra' ? 'infraestrutura' : tag === 'segments' ? 'segmentação' : 'rotas')}</span>`).join('')}</div>`;
  }

  function displayOverview() {
    selectedId = null;
    selectionRing.visible = false;
    panelEyebrow.textContent = 'PAINEL DE INFORMAÇÕES';
    panelTitle.textContent = 'Explore a rede';
    panelIcon.textContent = '⌘';
    panelIntro.textContent = 'Selecione um equipamento ou segmento no modelo 3D para ver sua função, endereçamento e conexões.';
    panelContent.innerHTML = `<div class="empty-state">A topologia está organizada em camadas: borda, segurança, core, acesso e Wi-Fi.<br><br>Use os filtros no topo para destacar infraestrutura, VLANs ou rotas. Clique em “Simular tráfego” para acompanhar um pacote saindo do Wi-Fi 1 até a Internet.</div>`;
  }

  const routeRows = [
    ['10.0.1.0/24', 'Diretamente conectada'],
    ['10.0.10.0/24', 'Diretamente conectada · APs .1–.4'],
    ['10.0.50.0/24', 'Diretamente conectada · VLAN 50'],
    ['192.168.10.0/24', '10.0.10.1 · AP 1'],
    ['192.168.20.0/24', '10.0.10.2 · AP 2'],
    ['192.168.30.0/24', '10.0.10.3 · AP 3'],
    ['192.168.40.0/24', '10.0.10.4 · AP 4'],
    ['0.0.0.0/0', '10.0.1.1 · FortiGate']
  ];

  function displayRoutes() {
    selectedId = null;
    selectionRing.visible = false;
    panelEyebrow.textContent = 'TABELA DE ROTEAMENTO';
    panelTitle.textContent = 'Rotas principais';
    panelIcon.textContent = '↗';
    panelIntro.textContent = 'Resumo dos destinos e próximos saltos adotados na topologia.';
    panelContent.innerHTML = `<div class="route-list">${routeRows.map(([dest, next]) => `<div class="route-row"><span class="route-destination">${escapeHtml(dest)}</span><span class="route-next">${escapeHtml(next)}</span></div>`).join('')}</div>`;
  }

  function displaySegments() {
    selectedId = null;
    selectionRing.visible = false;
    panelEyebrow.textContent = 'PLANO DE ENDEREÇAMENTO';
    panelTitle.textContent = 'VLANs e sub-redes';
    panelIcon.textContent = '▦';
    panelIntro.textContent = 'As quatro redes Wi-Fi de clientes são distintas da rede intermediária de gerenciamento dos APs.';
    const rows = [
      ['Borda', '10.0.1.0/24', colors.blue],
      ['APs / intermediária', '10.0.10.0/24 · APs .1 a .4', colors.purple],
      ['VLAN 50 · servidores', '10.0.50.0/24', colors.orange],
      ['Wi-Fi 1 · DHCP', '192.168.10.0/24', colors.cyan],
      ['Wi-Fi 2 · DHCP', '192.168.20.0/24', colors.cyan],
      ['Wi-Fi 3 · DHCP', '192.168.30.0/24', colors.cyan],
      ['Wi-Fi 4 · DHCP', '192.168.40.0/24', colors.cyan]
    ];
    panelContent.innerHTML = rows.map(([name, subnet, color]) => `<div class="vlan-row"><i class="vlan-dot" style="background:#${color.toString(16).padStart(6,'0')}"></i><div><strong>${escapeHtml(name)}</strong><code>${escapeHtml(subnet)}</code></div></div>`).join('');
  }

  function setView(view) {
    activeView = view;
    document.querySelectorAll('.view-tab').forEach(button => button.classList.toggle('active', button.dataset.view === view));
    nodeData.forEach(data => {
      const group = nodeGroups[data.id];
      const relevant = view === 'all' || data.tags.includes(view);
      group.traverse(object => {
        if (!object.material) return;
        const mats = Array.isArray(object.material) ? object.material : [object.material];
        mats.forEach(material => {
          material.transparent = true;
          material.opacity = relevant ? (object.userData.baseOpacity || 1) : 0.14;
        });
      });
    });
    edgeObjects.forEach(edge => {
      const a = byId[edge.sourceId].tags;
      const b = byId[edge.targetId].tags;
      const relevant = view === 'all' || a.includes(view) || b.includes(view);
      edge.line.material.opacity = relevant ? (edge.type === 'wifi' ? 0.72 : 0.9) : 0.1;
      edge.arrow.material.opacity = relevant ? 0.95 : 0.08;
    });
    if (view === 'routes') displayRoutes();
    else if (view === 'segments') displaySegments();
    else if (selectedId) displayNode(byId[selectedId]);
    else displayOverview();
  }

  document.querySelectorAll('.view-tab').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));

  function setPointer(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
  }
  renderer.domElement.addEventListener('pointerdown', event => { downPoint = [event.clientX, event.clientY]; });
  renderer.domElement.addEventListener('pointermove', event => {
    setPointer(event);
    const hit = raycaster.intersectObjects(pickables, false).length > 0;
    renderer.domElement.style.cursor = hit ? 'pointer' : 'grab';
  });
  renderer.domElement.addEventListener('pointerup', event => {
    if (!downPoint || Math.hypot(event.clientX - downPoint[0], event.clientY - downPoint[1]) > 5) { downPoint = null; return; }
    setPointer(event);
    const hit = raycaster.intersectObjects(pickables, false).find(item => item.object.userData.nodeId);
    if (hit) displayNode(byId[hit.object.userData.nodeId]);
    downPoint = null;
  });

  document.getElementById('resetView').addEventListener('click', () => {
    camera.position.set(18, 17, 29);
    controls.target.set(0, 0, 0);
    controls.update();
    displayOverview();
  });

  const trafficPath = ['wifi1', 'ap1', 'sw1', 'core', 'firewall', 'router', 'internet'];
  let simulation = false;
  let segmentIndex = 0;
  let segmentProgress = 0;
  const flowStatus = document.getElementById('flowStatus');
  const simulateButton = document.getElementById('simulateButton');
  simulateButton.addEventListener('click', () => {
    simulation = !simulation;
    particle.visible = simulation;
    simulateButton.classList.toggle('running', simulation);
    simulateButton.innerHTML = simulation ? '<span class="play-icon">Ⅱ</span> Pausar simulação' : '<span class="play-icon">▶</span> Simular tráfego Wi-Fi → Internet';
    segmentIndex = 0;
    segmentProgress = 0;
    flowStatus.textContent = simulation ? 'Pacote partindo da rede Wi-Fi 1…' : '';
    if (simulation) setView('all');
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.05);
    controls.update();
    if (simulation) {
      segmentProgress += delta * 0.68;
      if (segmentProgress >= 1) {
        segmentProgress = 0;
        segmentIndex = (segmentIndex + 1) % (trafficPath.length - 1);
        const current = byId[trafficPath[segmentIndex]];
        flowStatus.textContent = `Pacote: ${current.title} → ${byId[trafficPath[segmentIndex + 1]].title}`;
      }
      const from = new THREE.Vector3(...byId[trafficPath[segmentIndex]].pos);
      const to = new THREE.Vector3(...byId[trafficPath[segmentIndex + 1]].pos);
      particle.position.lerpVectors(from, to, segmentProgress);
      particle.position.y += 0.4 + Math.sin(performance.now() * 0.009) * 0.12;
    }
    if (selectionRing.visible) selectionRing.rotation.z += delta * 0.45;
    renderer.render(scene, camera);
  }

  displayOverview();
  animate();
})();

# Simulador 3D da rede

Aplicação estática feita com HTML, CSS, JavaScript e Three.js. Não requer instalação de dependências nem etapa de build.

## Como abrir

1. Abra `index.html` no navegador.
2. Mantenha conexão com a Internet para carregar Three.js e as fontes usadas pela interface.

Se o navegador bloquear algum recurso ao abrir o arquivo diretamente, execute na pasta do projeto:

```powershell
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Interações

- Arraste para girar a topologia e use a roda do mouse para aproximar/afastar.
- Clique nos equipamentos ou redes para ver detalhes no painel lateral.
- Use os filtros para destacar infraestrutura, sub-redes/VLANs ou rotas.
- Clique em **Simular tráfego Wi-Fi → Internet** para animar um pacote da rede Wi-Fi 1 até a Internet.
- Use o botão de recenter para restaurar a câmera.

Os endereços e próximos saltos seguem as premissas assumidas no documento: APs em `10.0.10.0/24` (`.1` a `.4`) e redes de clientes em `192.168.10.0/24` a `192.168.40.0/24`.

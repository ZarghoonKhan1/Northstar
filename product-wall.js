// Featured products carousel.
//
// The wall is fed by the live catalog: app.js dispatches `northstar:catalog`
// after every catalog change and `northstar:product-image` when a picture blob
// is ready. Cards look like a normal store strip (picture, name, price, link),
// so the section reads as merchandising rather than a wall of loose images.

const marquee = document.getElementById('productMarquee');
const wall = document.querySelector('.floating-wall');
const ROW_COUNT = 2;
const MAX_CARDS = 24;
const MIN_ROW_SECONDS = 45;

const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });
let renderedSignature = '';
let emptyTimer = 0;

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function sortForDisplay(products) {
  return [...products].sort((first, second) => {
    const delta = hashString(first.id || first.name) - hashString(second.id || second.name);
    return delta || String(first.name).localeCompare(String(second.name));
  });
}

function cardMarkup(product, imageUrl) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'featured-card';
  card.dataset.productId = product.id;
  card.title = `${product.name} — ${money.format(product.priceCents / 100)}`;
  card.setAttribute(
    'aria-label',
    `${product.name}, ${money.format(product.priceCents / 100)}. View details.`
  );
  if (product.imagePath) card.dataset.imagePath = product.imagePath;

  const media = document.createElement('span');
  media.className = 'featured-card-media';

  const image = document.createElement('img');
  image.alt = '';
  image.loading = 'lazy';
  image.decoding = 'async';
  image.width = 240;
  image.height = 180;
  if (imageUrl) {
    image.src = imageUrl;
  } else {
    image.hidden = true;
  }

  const fallback = document.createElement('span');
  fallback.className = 'featured-card-fallback';
  fallback.textContent = product.name.slice(0, 2).toUpperCase();
  fallback.hidden = Boolean(imageUrl);
  media.append(image, fallback);

  const body = document.createElement('span');
  body.className = 'featured-card-body';

  const name = document.createElement('span');
  name.className = 'featured-card-name';
  name.textContent = product.name;

  const footer = document.createElement('span');
  footer.className = 'featured-card-footer';

  const price = document.createElement('span');
  price.className = 'featured-card-price';
  price.textContent = money.format(product.priceCents / 100);

  const cta = document.createElement('span');
  cta.className = 'featured-card-cta';
  cta.textContent = 'Details';

  footer.append(price, cta);
  body.append(name, footer);
  card.append(media, body);
  return card;
}

function createGroup(products, imageLookup, isDuplicate) {
  const group = document.createElement('div');
  group.className = 'marquee-group';
  if (isDuplicate) group.setAttribute('aria-hidden', 'true');
  products.forEach((product) => {
    group.append(cardMarkup(product, imageLookup(product)));
  });
  return group;
}

function render(products, ready) {
  if (!marquee || !wall) return;

  const featured = sortForDisplay(products.filter((product) => product.imagePath))
    .slice(0, MAX_CARDS);
  const signature = featured.map((product) => `${product.id}:${product.imagePath}`).join('|');

  if (!featured.length) {
    if (!ready) return;
    if (!emptyTimer) {
      emptyTimer = window.setTimeout(() => {
        wall.hidden = true;
        marquee.replaceChildren();
        renderedSignature = '';
        emptyTimer = 0;
      }, 1500);
    }
    return;
  }

  if (emptyTimer) {
    window.clearTimeout(emptyTimer);
    emptyTimer = 0;
  }

  wall.hidden = false;
  if (signature === renderedSignature) return;
  renderedSignature = signature;

  const imageLookup = (product) => product.imageUrl || '';
  const perRow = Math.ceil(featured.length / ROW_COUNT);
  const rows = Array.from({ length: ROW_COUNT }, (_, index) => {
    const slice = featured.slice(index * perRow, (index + 1) * perRow);
    return slice.length ? slice : featured.slice(0, perRow);
  }).filter((row) => row.length);

  const fragment = document.createDocumentFragment();
  rows.forEach((row, index) => {
    const line = document.createElement('div');
    line.className = `marquee-row-line marquee-row-${index + 1}`;
    line.setAttribute('role', 'group');
    line.setAttribute('aria-label', `Featured products, row ${index + 1}`);

    const track = document.createElement('div');
    track.className = 'marquee-track';
    track.style.setProperty(
      '--marquee-duration',
      `${Math.max(MIN_ROW_SECONDS, row.length * 6)}s`
    );
    track.append(
      createGroup(row, imageLookup, false),
      createGroup(row, imageLookup, true)
    );
    line.append(track);
    fragment.append(line);
  });

  marquee.replaceChildren(fragment);
}

function applyImage({ path, url }) {
  if (!marquee || !path || !url) return;
  marquee.querySelectorAll(`[data-image-path="${CSS.escape(path)}"]`).forEach((card) => {
    const image = card.querySelector('img');
    const fallback = card.querySelector('.featured-card-fallback');
    if (!image || image.getAttribute('src') === url) return;
    image.src = url;
    image.hidden = false;
    if (fallback) fallback.hidden = true;
  });
}

if (marquee) {
  marquee.replaceChildren(
    ...Array.from({ length: ROW_COUNT }, (_, index) => {
      const line = document.createElement('div');
      line.className = `marquee-row-line marquee-row-${index + 1}`;
      const track = document.createElement('div');
      track.className = 'marquee-track marquee-track-loading';
      track.style.setProperty('--marquee-duration', '60s');
      const group = document.createElement('div');
      group.className = 'marquee-group';
      group.append(
        ...Array.from({ length: 6 }, () => {
          const skeleton = document.createElement('span');
          skeleton.className = 'featured-card featured-card-skeleton';
          skeleton.setAttribute('aria-hidden', 'true');
          skeleton.append(document.createElement('span'), document.createElement('span'));
          return skeleton;
        })
      );
      track.append(group, group.cloneNode(true));
      line.append(track);
      return line;
    })
  );

  window.addEventListener('northstar:catalog', (event) => {
    const products = Array.isArray(event.detail?.products) ? event.detail.products : [];
    render(products, event.detail?.ready !== false);
  });

  window.addEventListener('northstar:product-image', (event) => {
    if (event.detail) applyImage(event.detail);
  });

  window.dispatchEvent(new CustomEvent('northstar:featured-request'));
}

let links = [];

fetch('links.json')
  .then(res => res.json())
  .then(data => {
    links = data;
    renderColumns();
  })
  .catch(err => {
    document.getElementById('columns').textContent = 'Ошибка загрузки данных';
    console.error(err);
  });

const searchInput = document.getElementById('search');

let debounceTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(renderColumns, 200);
});

function renderColumns() {
  const query = searchInput.value.trim().toLowerCase();
  const container = document.getElementById('columns');
  container.innerHTML = '';

  // Фильтрация ссылок по запросу
  const filteredLinks = links.filter(link => {
    const subtags = Array.isArray(link.subtag) ? link.subtag : [link.subtag];
    return (
      link.title.toLowerCase().includes(query) ||
      link.url.toLowerCase().includes(query) ||
      subtags.some(st => st && st.toLowerCase().includes(query))
    );
  });

  if (filteredLinks.length === 0) {
    container.textContent = 'Ничего не найдено';
    return;
  }

  // Группировка: tag -> subtag -> [links]
  const grouped = {};
  filteredLinks.forEach(link => {
    const tag = link.tag;
    const subtags = Array.isArray(link.subtag) ? link.subtag : [link.subtag];
    if (!grouped[tag]) grouped[tag] = {};
    subtags.forEach(subtag => {
      if (!subtag) return;
      if (!grouped[tag][subtag]) grouped[tag][subtag] = [];
      grouped[tag][subtag].push(link);
    });
  });

  for (const tag of Object.keys(grouped).sort()) {
    const col = createColumn(tag);

    for (const subtag of Object.keys(grouped[tag]).sort()) {
      col.appendChild(createSubHeader(subtag));
      col.appendChild(createLinksList(grouped[tag][subtag]));
    }

    container.appendChild(col);
  }
}

// Вспомогательные функции для создания элементов
function createColumn(tag) {
  const col = document.createElement('div');
  col.className = 'column';
  const h2 = document.createElement('h2');
  h2.textContent = tag;
  col.appendChild(h2);
  return col;
}

function createSubHeader(subtag) {
  const h3 = document.createElement('h3');
  h3.textContent = subtag;
  return h3;
}

function createLinksList(links) {
  const ul = document.createElement('ul');
  links.forEach(link => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = link.url;
    a.target = '_blank';
    a.textContent = link.title;
    li.appendChild(a);
    ul.appendChild(li);
  });
  return ul;
}
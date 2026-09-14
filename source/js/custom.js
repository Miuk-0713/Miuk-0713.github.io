function openSearch() {
  var searchBtn = document.getElementById('search-btn') || document.getElementById('search-button') || document.querySelector('#navbar .nav-link[data-target="#modalSearch"]');
  if (searchBtn) {
    searchBtn.querySelector('a') ? searchBtn.querySelector('a').click() : searchBtn.click();
    return;
  }
  var searchInput = document.querySelector('#local-search-input') || document.querySelector('.search-input');
  if (searchInput) searchInput.focus();
}

document.addEventListener('keydown', function (e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    openSearch();
    return;
  }
  if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
    var tag = document.activeElement.tagName.toLowerCase();
    if (tag !== 'input' && tag !== 'textarea' && !document.activeElement.isContentEditable) {
      e.preventDefault();
      openSearch();
    }
  }
});
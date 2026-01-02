document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.code-tabs').forEach(initTabContainer);
});

function initTabContainer(tabContainer) {
  var buttons = tabContainer.querySelectorAll('.code-tabs-nav button');
  var contents = tabContainer.querySelectorAll('.code-tab-content');
  var savedLang = localStorage.getItem('preferred-code-lang');

  var initialTab = findTabByLang(buttons, savedLang) || buttons[0];
  activateTab(initialTab, buttons, contents, false);

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      activateTab(button, buttons, contents, true);
    });
  });
}

function findTabByLang(buttons, lang) {
  if (!lang) return null;
  var found = null;
  buttons.forEach(function (btn) {
    if (btn.dataset.lang === lang) found = btn;
  });
  return found;
}

function activateTab(button, allButtons, allContents, shouldSave) {
  var lang = button.dataset.lang;

  allButtons.forEach(function (btn) {
    btn.classList.remove('active');
  });
  button.classList.add('active');

  allContents.forEach(function (content) {
    content.classList.toggle('active', content.dataset.lang === lang);
  });

  if (shouldSave && lang) {
    localStorage.setItem('preferred-code-lang', lang);
    syncAllTabGroups(lang);
  }
}

function syncAllTabGroups(lang) {
  document.querySelectorAll('.code-tabs').forEach(function (container) {
    var targetButton = container.querySelector('[data-lang="' + lang + '"]');
    if (targetButton && !targetButton.classList.contains('active')) {
      activateTab(
        targetButton,
        container.querySelectorAll('.code-tabs-nav button'),
        container.querySelectorAll('.code-tab-content'),
        false
      );
    }
  });
}

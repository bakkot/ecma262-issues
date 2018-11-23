'use strict';

const STORAGE_KEY = 'issue-doneness';

let table, headers;
addEventListener('load', () => {
  table = document.querySelector('.table');
  headers = table.querySelectorAll('.header');

  try {
    let old = localStorage.getItem(STORAGE_KEY);
    if (old != null) {
      let list = JSON.parse(old);
      for (let issue of issues) {
        issue.done = list[issue.number] != null && !!list[issue.number].done;
      }
    }
  } catch (e) {
    console.error(e);
      for (let issue of issues) {
        issue.done = false;
      }
    // don't worry about it
  }

  for (let issue of issues) {
    table.append(...renderIssue(issue));
  }

  let sorters = document.querySelectorAll('.sort');
  for (let sorter of sorters) {
    sorter.addEventListener('click', () => {
      for (let other of sorters) {
        other.textContent = '↕';
      }
      sort(sorter.dataset.which);
      sorter.textContent = sortings[sorter.dataset.which] ? '↑' : '↓';
    });
  }
});


const saveDoneness = () => {
  try {
    let data = {};
    for (let issue of issues) {
      data[issue.number] = issue.done ? { done: true } : {};
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error(e);
    // don't worry about it
  }
};


let ce = document.createElement.bind(document);

const box = () => {
  let ret = ce('div');
  ret.classList.add('box');
  return ret;
}

const renderIssue = issue => {
  let done = box();
  let checkbox = ce('input');
  checkbox.type = 'checkbox';
  checkbox.checked = issue.done;
  done.append(checkbox);

  let number = box();
  number.id = 'issue-' + issue.number;
  let numberLink = ce('a');
  numberLink.href = `https://github.com/tc39/ecma262/${issue.pr ? 'pull' : 'issues'}/${issue.number}`;
  numberLink.textContent = '#' + issue.number;
  numberLink.target = '_blank';
  numberLink.rel = 'noopener';
  number.append(numberLink);

  let isPr = box();
  isPr.textContent = issue.pr ? '✅' : '❌';

  let title = box();
  title.textContent = issue.title;

  let kind = box();
  kind.textContent = issue.kind; // TODO emoji

  let status = box();
  status.textContent = statusEmoji(issue.status);
  status.title = issue.status;

  let notes = box();
  let noteContent = 'notes' in issue ? issue.notes.replace(/</g, '&lt;') : '' ;
  noteContent = noteContent.replace(/\#([0-9]+)/g, '<a href="#issue-$1">#$1</a>');
  notes.innerHTML = noteContent;

  let eles = [done, number, isPr, title, kind, status, notes];
  for (let ele of eles) {
    if (issue.done) {
      ele.classList.add('done');
    } else {
      ele.classList.remove('done');
    }
  }

  checkbox.addEventListener('change', () => {
    issue.done = checkbox.checked;
    for (let ele of eles) {
      if (issue.done) {
        ele.classList.add('done');
      } else {
        ele.classList.remove('done');
      }
    }
    saveDoneness();
  });

  issue.eles = eles;

  return eles;
};

const statusEmoji = status => {
  switch (status) {
    case 'blocked':
      return '🚫';
    case 'needs specialist':
      return '🔬';
    case 'needs editor':
      return '📝';
    case 'needs work':
      return '🚧';
    case 'pending stage 4':
      return '④';
    case 'needs committee':
      return '👪';
    case 'unsure':
      return '❓';
    default:
      console.error('unrecognized status ' + status);
      return status;
  }
};


let sortings = {
  number: true,
  title: false,
  status: false,
  kind: false,
  note: false,
};
const sort = item => {
  let direction = !sortings[item];
  sortings[item] = direction;
  issues.sort((a, b) => {
    let ai = item in a ? a[item] : '';
    let bi = item in b ? b[item] : '';
    if (ai < bi) {
      return direction ? 1 : -1;
    } else if (bi < ai) {
      return direction ? -1 : 1;
    }
    return 0;
  });

  table.innerHTML = '';
  table.append(...headers);
  for (let issue of issues) {
    table.append(...issue.eles);
  }
};

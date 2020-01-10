function TreeTable(idTable, settings) {
    'use strict';

    if (!EsTipo('string', idTable) && !EsTipo('object', settings)) return false;

    var columns = EsTipo('array', settings.columns) ? settings.columns : [];
    var data = EsTipo('array', settings.data) ? settings.data : [];
    var tree = EsTipo('array', settings.tree) ? settings.tree : [];

    var table = document.getElementById(idTable);
    if (!table) return false;

    table.innerHTML = '';

    var thead = document.createElement('thead');
    var trHead = document.createElement('tr');
    columns.forEach(function(c) {
        var th = document.createElement('th');
        var title = c.title ? c.title : '';
        var className = c.className ? c.className : '';
        th.innerHTML = title;
        th.className = className;
        trHead.appendChild(th);
    });

    thead.appendChild(trHead);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');

    if (data.length === 0) {
        var trEmpty = document.createElement('tr');
        var tdEmpty = document.createElement('td');
        tdEmpty.innerHTML = 'NO SE ENCONTRARON REGISTROS';
        tdEmpty.colSpan = columns.length;
        tdEmpty.style.textAlign = 'center';
        trEmpty.appendChild(tdEmpty);
        tbody.appendChild(trEmpty);
    }
    function actionLink() {
        var $this = this;
        var tr = this.parentNode.parentNode;
        var target = '[data-parent="' + tr.getAttribute('data-index') + '"]';
        var isExpanded = $this.getAttribute('class') === 'fa fa-chevron-down';
        var body = tr.parentNode;
        var children = body.querySelectorAll(target);

        if (!isExpanded) {
            for (var c = 0, len = children.length; c < len; c++) {
                var current = children[c];
                current.setAttribute('class', 'collapse in');
                var a = current.querySelector('a[icon-tree-table]');
                if (a) a.className = 'fa fa-chevron-right';
            }
            $this.className = 'fa fa-chevron-down';
        } else {
            var closeChildren = function(children) {
                for (var i = 0, len = children.length; i < len; i++) {
                    var current = children[i];
                    current.setAttribute('class', 'collapse');
                    var id = current.getAttribute('data-index');
                    var child = body.querySelectorAll('[data-parent="' + id + '"]');
                    var a = current.querySelector('a[class="fa fa-chevron-down"]');
                    if (child.length > 0 && a) closeChildren(child);
                }
            };
            closeChildren(children);
            $this.className = 'fa fa-chevron-right';
        }
    }

    var index = -1;
    function level(dataLevel, lv, parentRow) {
        for (var id = 0, len = dataLevel.length; id < len; id++) {
            index++;
            var row = dataLevel[id];
            var tr = document.createElement('tr');
            var numCol = columns.length;

            for (var i = 0; i < numCol; i++) {
                var data = row[columns[i].data] ? row[columns[i].data] : '';
                var text = EsTipo('function', columns[i].render)
                    ? columns[i].render(data, tr, row, index)
                    : data;
                var content = document.createElement('div');
                content.style.display = 'inline-block';
                content.innerHTML = text;
                if (i === 0 && EsTipo('array', row[tree[lv - 1]]) && row[tree[lv - 1]].length > 0) {
                    var tdPrimary = document.createElement('td');
                    var icon = document.createElement('a');
                    icon.className = 'fa fa-chevron-right';
                    icon.setAttribute('icon-tree-table', true);
                    icon.addEventListener('click', actionLink, false);
                    tdPrimary.appendChild(icon);
                    tdPrimary.appendChild(content);
                    tdPrimary.className = columns[i].className ? columns[i].className : '';
                    tdPrimary.setAttribute('style', 'padding-left: ' + lv + 'em !important');
                    tr.appendChild(tdPrimary);
                } else {
                    var td = document.createElement('td');
                    td.appendChild(content);
                    td.className = columns[i].className ? columns[i].className : '';
                    tr.appendChild(td);
                }
                if (lv > 1) {
                    tr.className = 'collapse';
                    tr.setAttribute('data-parent', parentRow);
                }
                tr.setAttribute('data-index', index);
            }
            tbody.appendChild(tr);

            for (var t = 0, lent = tree.length; t < lent; t++) {
                var ct = tree[lv - 1];

                if (EsTipo('array', row[ct])) {
                    level(row[ct], lv + 1, index);
                } else {
                    break;
                }
            }
        }
    }

    level(data, 1);

    table.appendChild(tbody);
}

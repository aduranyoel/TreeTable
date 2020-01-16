function TreeTable(idTable, settings) {
    'use strict';

    var table = document.getElementById(idTable);
    if (!table || Object.prototype.toString.call(settings) !== "[object Object]") return false;

    var allColumns = Array.isArray(settings.columns) ? settings.columns : [];
    var data = Array.isArray(settings.data) ? settings.data : [];
    var icons = Object.prototype.toString.call(icons) === "[object Object]" ? settings.icons : {};
    var iconCollapsed = icons.collapsed ? icons.collapsed : 'fa fa-chevron-right';
    var iconExpanded = icons.expanded ? icons.expanded : 'fa fa-chevron-down';
    var columns = [];

    for (var ac = 0, lenAc = allColumns.length; ac < lenAc; ac++) {
        var currentColumn = allColumns[ac];
        if (currentColumn['visible'] === false) continue;
        columns.push(currentColumn);
    }

    table.innerHTML = '';

    var thead = document.createElement('thead');
    var trHead = document.createElement('tr');
    var columnsLength = columns.length;

    for (var cl = 0; cl < columnsLength; cl++) {
        var ccl = columns[cl];
        var th = document.createElement('th');
        var title = ccl.title ? ccl.title : '';
        var className = ccl.className ? ccl.className : '';
        th.innerHTML = title;
        th.className = className;
        trHead.appendChild(th);
    }

    thead.appendChild(trHead);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');

    if (data.length === 0) {
        var trEmpty = document.createElement('tr');
        var tdEmpty = document.createElement('td');
        tdEmpty.innerHTML = 'NO SE ENCONTRARON REGISTROS';
        tdEmpty.colSpan = columnsLength;
        tdEmpty.style.textAlign = 'center';
        trEmpty.appendChild(tdEmpty);
        tbody.appendChild(trEmpty);
    }
    function actionLink() {
        var icon = this;
        var tr = this.parentNode.parentNode;
        var target = '[data-parent="' + tr.getAttribute('data-index') + '"]';
        var isExpanded = tr.getAttribute('data-control') === 'expanded';
        var body = tr.parentNode;
        var children = body.querySelectorAll(target);

        if (!isExpanded) {

            for (var c = 0, len = children.length; c < len; c++) {
                var current = children[c];
                current.style.display = '';
                var a = current.querySelector('a[icon-tree-table]');
                if (a) a.className = iconCollapsed;
            }
            icon.className = iconExpanded;
            tr.setAttribute('data-control', 'expanded');
        } else {

            var closeChildren = function (children) {
                for (var i = 0, len = children.length; i < len; i++) {
                    var current = children[i];
                    current.style.display = 'none';
                    var id = current.getAttribute('data-index');
                    var child = body.querySelectorAll('[data-parent="' + id + '"]');
                    var currentExpanded = current.getAttribute('data-control') === 'expanded';
                    if (child.length > 0 && currentExpanded) {
                        current.setAttribute('data-control', 'collapsed');
                        closeChildren(child);
                    }
                }
            };
            closeChildren(children);
            icon.className = iconCollapsed;
            tr.setAttribute('data-control', 'collapsed');
        }
    }

    var index = -1;
    function level(dataLevel, lv, parentRow) {

        for (var id = 0, len = dataLevel.length; id < len; id++) {

            index++;
            var row = dataLevel[id];
            var treeChildren = [];
            var tr = document.createElement('tr');

            for (var ch in row) {
                if (Array.isArray(row[ch]) && row[ch].length > 0) treeChildren.push(ch);
            }

            for (var c = 0; c < columnsLength; c++) {
                row[columns[c].data] = row[columns[c].data] ? row[columns[c].data] : '';
            }

            for (var i = 0; i < columnsLength; i++) {

                var data = row[columns[i].data];
                var text = typeof columns[i].render === 'function' ? columns[i].render(data, tr, row, index) : data;
                var content = document.createElement('div');
                content.style.display = 'inline-block';
                content.innerHTML = text;
                if (i === 0 && treeChildren.length > 0) {
                    var tdPrimary = document.createElement('td');
                    var icon = document.createElement('a');
                    icon.className = iconCollapsed;
                    icon.setAttribute('icon-tree-table', true);
                    icon.addEventListener('click', actionLink, false);
                    tdPrimary.appendChild(icon);
                    tdPrimary.appendChild(content);
                    tdPrimary.className = columns[i].className ? columns[i].className : '';
                    tdPrimary.setAttribute('style', 'padding-left: ' + lv * 11 + 'px !important');
                    tr.appendChild(tdPrimary);
                    tr.setAttribute('data-control', 'collapsed');
                } else {
                    var td = document.createElement('td');
                    td.appendChild(content);
                    td.className = columns[i].className ? columns[i].className : '';
                    tr.appendChild(td);
                }
                if (lv > 1) {
                    tr.style.display = 'none';
                    tr.setAttribute('data-parent', parentRow);
                }
                tr.setAttribute('data-index', index);
                tr.setAttribute('data-level', lv);
            }
            tbody.appendChild(tr);

            for (var t = 0, lent = treeChildren.length; t < lent; t++) {

                var ct = treeChildren[t];

                level(row[ct], lv + 1, index);
            }
        }
    }

    level(data, 1);

    table.appendChild(tbody);
}
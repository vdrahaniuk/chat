var TableEditable = function () {

    return {

        //main function to initiate the module
        init: function () {
            function restoreRow(oTable, nRow) {
                var aData = oTable.fnGetData(nRow);
                var jqTds = $('>td', nRow);

                for (var i = 0, iLen = jqTds.length; i < iLen; i++) {
                    oTable.fnUpdate(aData[i], nRow, i, false);
                }

                oTable.fnDraw();
            }

            function editRow(oTable, nRow) {
                var aData = oTable.fnGetData(nRow);
                var jqTds = $('>td', nRow);
                jqTds[0].innerHTML = '<input type="text" class="m-wrap small" value="' + aData[0] + '">';
                jqTds[1].innerHTML = '<a class="edit" href="">Сохранить</a>';
                jqTds[2].innerHTML = '<a class="cancel" href="">Отмена</a>';
            }

            function saveRow(oTable, nRow) {
                var jqInputs = $('input', nRow);
                oTable.fnUpdate(jqInputs[0].value, nRow, 0, false);
                oTable.fnUpdate('<a class="edit" href="">Редактировать</a>', nRow, 1, false);
                oTable.fnUpdate('<a class="delete" href="">Удалить</a>', nRow, 2, false);
                oTable.fnDraw();
            }

            function cancelEditRow(oTable, nRow) {
                var jqInputs = $('input', nRow);
                oTable.fnUpdate(jqInputs[0].value, nRow, 0, false);
                oTable.fnUpdate('<a class="edit" href="">Edit</a>', nRow, 4, false);
                oTable.fnDraw();
            }

            function saveRowAjax (oTable, nRow) {
                var jqInputs = $('input', nRow);
                var type = 'save';
                debugger;
                if (nRow.id.length > 0) {
                    type = 'update';
                };
                var request = $.ajax({
                    url: "/secret/rubrics/ajax",
                    type: "POST",
                    data: { 'value' : jqInputs[0].value, 'type' : type, 'id' : nRow.id},
                    dataType: "json"
                });
                request.fail(function( jqXHR, textStatus ) {
                    oTable.fnDeleteRow(nRow);
                });
                request.done(function(data) {
                    nRow.setAttribute("id", data.id);
                });
            }

            function deleteRowAjax (oTable, nRow) {
                return request = $.ajax({
                    url: "/secret/rubrics/ajax",
                    type: "POST",
                    asinc: true,
                    data: { 'value' : nRow.id, 'type' : 'delete'},
                    dataType: "json"
                });
            }
            function deleteReviewAjax (oTable, nRow, id) {
                return request = $.ajax({
                    url: "/secret/movie/deletereview",
                    type: "POST",
                    asinc: true,
                    data: { 'value' : id, 'type' : 'delete'},
                    dataType: "json"
                });
            }

            var oTable = $('#sample_editable_1').dataTable({
                "aLengthMenu": [
                [5, 15, 20, -1],
                    [5, 15, 20, "Все"] // change per page values here
                    ],
                // set the initial value
                "iDisplayLength": 5,
                "sDom": "<'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
                "sPaginationType": "bootstrap",
                "oLanguage": {
                    "sLengthMenu": "_MENU_ записей на странице",
                    "sEmptyTable": "Нет данных в таблице",
                    "oPaginate": {
                        "sPrevious": "Назад",
                        "sNext": "Вперед"
                    }
                },
                "aoColumnDefs": [{
                    'bSortable': true,
                    'aTargets': [0]
                }
                ]
            });

            jQuery('#sample_editable_1_wrapper .dataTables_filter input').addClass("m-wrap medium"); // modify table search input
            jQuery('#sample_editable_1_wrapper .dataTables_length select').addClass("m-wrap xsmall"); // modify table per page dropdown

            var nEditing = null;

            $('#sample_editable_1_new').click(function (e) {
                e.preventDefault();
                var aiNew = oTable.fnAddData(['', '', '', '',
                    '<a class="edit" href="">Edit</a>', '<a class="cancel" data-mode="new" href="">Cancel</a>'
                    ]);
                var nRow = oTable.fnGetNodes(aiNew[0]);
                editRow(oTable, nRow);
                nEditing = nRow;
            });

            $('#sample_editable_1 a.delete').live('click', function (e) {
                e.preventDefault();

                if (confirm("Вы уверены, что хотите удалить эту рубрику ?") == false) {
                    return;
                }

                var nRow = $(this).parents('tr')[0];
                if (deleteRowAjax(oTable, nRow)) {
                    oTable.fnDeleteRow(nRow);
                };
            });
            $('#sample_editable_1 a.deleteR').live('click', function (e) {
                e.preventDefault();

                if (confirm("Вы уверены, что хотите удалить этот комментарий ?") == false) {
                    return;
                }

                var nRow = $(this).parents('tr')[0];
                var id = $(this).data('id')
                if (deleteReviewAjax(oTable, nRow, id)) {
                    oTable.fnDeleteRow(nRow);
                };
            });

            $('#sample_editable_1 a.cancel').live('click', function (e) {
                e.preventDefault();
                if ($(this).attr("data-mode") == "new") {
                    var nRow = $(this).parents('tr')[0];
                    oTable.fnDeleteRow(nRow);
                } else {
                    restoreRow(oTable, nEditing);
                    nEditing = null;
                }
            });

            $('#sample_editable_1 a.edit').live('click', function (e) {
                e.preventDefault();

                /* Get the row as a parent of the link that was clicked on */
                var nRow = $(this).parents('tr')[0];
                // debugger;
                if (nEditing !== null && nEditing != nRow) {
                    /* Currently editing - but not this row - restore the old before continuing to edit mode */
                    restoreRow(oTable, nEditing);
                    editRow(oTable, nRow);
                    nEditing = nRow;
                } else if (nEditing == nRow && this.innerHTML == "Сохранить") {
                    /* Editing this row and want to save it */
                    saveRowAjax(oTable, nRow);
                    saveRow(oTable, nEditing);
                    nEditing = null;

                } else {
                    /* No edit in progress - let's start one */
                    editRow(oTable, nRow);
                    nEditing = nRow;
                }
            });
        }

    };

}();
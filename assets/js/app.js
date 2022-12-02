;(function ($) {
	'use strict';
	let windowWidth = $(window).width();

	let handleSearch = function () {
		if ($('#chartSearch').length) {
			let chartSearch = $('#chartSearch'),
				chartSearch_wrap = chartSearch.closest('.chart-search');
			chartSearch.keyup(function () {
				let chartSearch_elm = $(this),
					chartSearch_value = $.trim(chartSearch_elm.val());

				if (chartSearch_value.length > 0) {
					chartSearch_wrap.addClass('is-show');
				} else {
					if (chartSearch_wrap.hasClass('is-show')) {
						chartSearch_wrap.removeClass('is-show');
					}
				}
			});

			$(document).mouseup(function (e) {
				if (chartSearch_wrap.hasClass('is-show') && !chartSearch_wrap.is(e.target) && chartSearch_wrap.has(e.target).length === 0) {
					chartSearch_wrap.removeClass('is-show');
					chartSearch.val('');
				}
			});
		}
	}

	let handleSort = function () {
		if ($('.chart-table_sort').length) {
			let chartSort = $('.chart-table_sort');
			chartSort.click(function () {
				let chartSort_elm = $(this);

				if (chartSort_elm.hasClass('chart-table_sort__up') === false && chartSort_elm.hasClass('chart-table_sort__down') === false) {
					chartSort.removeClass('chart-table_sort__up chart-table_sort__down');
					chartSort_elm.addClass('chart-table_sort__down');
				} else if (chartSort_elm.hasClass('chart-table_sort__up') === false && chartSort_elm.hasClass('chart-table_sort__down') === true) {
					chartSort_elm.removeClass('chart-table_sort__down').addClass('chart-table_sort__up');
				} else if (chartSort_elm.hasClass('chart-table_sort__up') === true && chartSort_elm.hasClass('chart-table_sort__down') === false) {
					chartSort_elm.removeClass('chart-table_sort__up');
				}
			});
		}
	}

	let handleSetMinWidth = function () {
		if (windowWidth < 991 && $('.chart-table_row').length) {
			let tempWidth = 0;
			$('.chart-table_row').each(function () {
				if ($(this)[0].scrollWidth > tempWidth) {
					tempWidth = $(this)[0].scrollWidth;
				}
			});

			$('.chart-table_body').css('width', tempWidth);
		}
	}

	$(function () {
		handleSearch();
		handleSort();
		handleSetMinWidth();
	});
})(jQuery);
;(function ($) {
	'use strict';
	const urlAPI_Data = 'https://wipomart.com/main.php';
	const urlAPI_Price = 'https://wipomart.com/getprice.php';
	const timeFetchPrice = 2000;
	let intervalPrice = '';
	let successFetchData = false;
	let windowWidth = $(window).width();

	let handleSetMinWidth = function () {
		if (windowWidth < 1280 && $('.chart-table_row').length) {
			let rowWidth = 0;
			$('.chart-table_row').each(function () {
				if ($(this)[0].scrollWidth > rowWidth) {
					rowWidth = $(this)[0].scrollWidth;
					if ($(this)[0].scrollWidth > rowWidth) {
						rowWidth = $(this)[0].scrollWidth;
					}
				}
			});
			$('.chart-table_body, .chart-table_header').css('width', '1900px');
		} else {
			$('.chart-table_body, .chart-table_header').css('width', '100%');
		}
	}

	let handleSetPadding = function () {
		if ($('.chart-table_header').length) {
			let row = $('.chart-table_header'), rowHeight = row.outerHeight(),
				filterHeight = $('#chart-filter').outerHeight(), textHeight = $('#chart-filter').outerHeight();
			if (windowWidth >= 1280) {
				row.parents('.chart-body').css('padding-top', filterHeight + rowHeight);
			} else if (windowWidth >= 992 && windowWidth < 1280) {
				row.parents('.chart-body').css('padding-top', filterHeight);
			} else {
				row.parents('.chart-body').css('padding-top', filterHeight + textHeight - 10);
			}
		}
	}

	const renderTemplate = function (data) {
		return `<div class="chart-table_row chart-table_border__row ${formatClass(parseInt(data.price_status))}" data-row="${data.stock_code}">
					<div class="chart-table_col chart-table_border__col chart-table_col__1 text-start justify-content-start">
						<span class="chart-table_text">
							${data.stock_code} <a href="" class="chart-table_btn">View More</a>
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__2 text-end justify-content-end">
						<span class="chart-table_text" data-price> 
							${data.stock_price}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__2 text-end justify-content-end">
						<span class="chart-table_text" data-price> 
							${data.stock_price}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__3 text-end justify-content-end chart-table_highlight">
						<span class="chart-table_text" data-percent>
							${data.changePercent}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__4 text-end justify-content-end chart-table_highlight">
						<span class="chart-table_text">
							${data.pe}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__5 text-end justify-content-end chart-table_highlight__2">
						<span class="chart-table_text">
							${data.eps}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__6 text-end justify-content-end">
						<span class="chart-table_text">
							${data.yearRevenueGrowth !== null ? formatPercent(data.yearRevenueGrowth) + '%' : 'Updating'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__7 text-end justify-content-end">
						<span class="chart-table_text">
							${data.quarterRevenueGrowth !== null ? formatPercent(data.quarterRevenueGrowth) + '%' : 'Updating'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__8 text-end justify-content-end">
						<span class="chart-table_text">
							${data.deposit !== null ? formatPrice(data.deposit) : 'Updating'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__9 text-end justify-content-end">
						<span class="chart-table_text">
							${data.revenue !== null ? formatPercent(data.revenue) : 'Updating'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__10 text-end justify-content-end">
						<span class="chart-table_text">
							${data.priceChange1y !== null ? formatPercent(data.priceChange1y) + '%' : 'Updating'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__11 text-end justify-content-end">
						<span class="chart-table_text">
							${data.priceChange3m !== null ? formatPercent(data.priceChange3m) + '%' : 'Updating'}
						</span>
					</div>
					<div class="chart-table_body__group">
						<div class="chart-table_col chart-table_border__col chart-table_col__same text-end">
							<span class="chart-table_text">
								${data.stock_high_next_day1 !== null ? data.stock_high_next_day1 : 'Updating'}
							</span>
						</div>
						<div class="chart-table_col chart-table_border__col chart-table_col__same text-end">
							<span class="chart-table_text">
								${data.stock_low_next_day1 !== null ? data.stock_low_next_day1 : 'Updating'}
							</span>
						</div>
						<div class="chart-table_col chart-table_border__col chart-table_col__same text-end chart-table_highlight">
							<span class="chart-table_text">
								${data.stock_close_next_day1 !== null ? data.stock_close_next_day1 : 'Updating'}
							</span>
						</div>
						<div class="chart-table_col chart-table_border__col chart-table_col__same text-end">
							<span class="chart-table_text">
								${data.stock_high_next_day2 !== null ? data.stock_high_next_day2 : 'Updating'}
							</span>
						</div>
						<div class="chart-table_col chart-table_border__col chart-table_col__same text-end">
							<span class="chart-table_text">
								${data.stock_low_next_day2 !== null ? data.stock_low_next_day2 : 'Updating'}
							</span>
						</div>
						<div class="chart-table_col chart-table_border__col chart-table_col__same text-end chart-table_highlight">
							<span class="chart-table_text">
								${data.stock_close_next_day2 !== null ? data.stock_close_next_day2 : 'Updating'}
							</span>
						</div>
						<div class="chart-table_col__group___last d-flex">
							<div class="chart-table_col chart-table_border__col chart-table_col__99 text-end chart-table_highlight">
								<span class="chart-table_text">
								Updating
								</span>
							</div>
							<div class="chart-table_col chart-table_border__col chart-table_col__100 text-end chart-table_highlight">
								<span class="chart-table_text">
									Updating
								</span>
							</div>
						</div>
					</div>
				</div>`;
	}

	const renderTemplateEmpty = function () {
		return '<div class="chart-table_row chart-table_border__row"><div class="chart-table chart-table_col chart-table_col__empty text-center w-100">Không có dữ liệu phù hợp</div></div>';
	}

	const formatPercent = function (value, fixed = 2) {
		return parseFloat(value).toFixed(fixed).replace(/\d(?=(\d{3})+\.)/g, '$&,');
	}

	const formatPrice = function (value) {
		value = value.replace(/[^0-9]/g, '');
		value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return value;
	}

	const formatClass = function (value) {
		let returnClass = '';
		switch (value) {
			case 0:
				returnClass = 'chart-text_warning';
				break;
			case 1:
				returnClass = 'chart-text_info';
				break;
			case 2:
				returnClass = 'chart-text_violet';
				break;
			case 3:
				returnClass = 'chart-text_success';
				break;
			case 4:
				returnClass = 'chart-text_danger';
				break;
			default:
				returnClass = 'chart-text_warning';
				break;
		}

		return returnClass
	}

	const handleSortString = function (data, columnSort, type) {
		let arrTemp = data.sort(function (a, b) {
			return (a[columnSort] < b[columnSort]) - (a[columnSort] > b[columnSort])
		});

		return (type == 'up') ? arrTemp.reverse() : arrTemp;
	}

	const handleSortNumber = function (data, columnSort, type) {
		let arrTemp = data.sort(function (a, b) {
			return parseFloat(a[columnSort] !== null ? a[columnSort] : 0) - parseFloat(b[columnSort] !== null ? b[columnSort] : 0)
		});

		return (type == 'up') ? arrTemp.reverse() : arrTemp;
	}

	const handleFetchPrice = function () {
		fetch(urlAPI_Price, {
			method: 'POST',
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.length) {
					data.map(function (data) {
						let rowChange = $('.chart-table_row[data-row="' + data.stock_code + '"]');
						if (rowChange.length) {
							rowChange.removeClass(function (index, className) {
								return (className.match(/(^|\s)chart-text_\S+/g) || []).join(' ');
							}).addClass(formatClass(parseInt(data.price_status)));
							rowChange.find('.chart-table_text[data-price]').html(data.stock_price);
							rowChange.find('.chart-table_text[data-percent]').html(data.changePercent);
						}
					});
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	const handleFetchData = async function (callBack) {
		await fetch(urlAPI_Data, {
			method: 'POST',
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.length) {
					$('#chart-list').html('');
					let renderTemplateList = '';
					data.map(function (data) {
						renderTemplateList += renderTemplate(data);
					});

					$('#chart-list').append(renderTemplateList);

					$('.chart-table_sort').removeClass('chart-disabled');
					handleSetMinWidth();

					if (callBack) {
						callBack(data);
					}
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	const handleColumnSort = function (column) {
		switch (column) {
			case 'price':
				return 'stock_price';
			case 'change':
				return 'changePercent';
			case 'pe':
				return 'pe';
			case 'eps':
				return 'eps';
			case 'year':
				return 'yearRevenueGrowth';
			case 'quarter':
				return 'quarterRevenueGrowth';
			case 'deposit':
				return 'deposit';
			case 'revenue':
				return 'revenue';
			case 'price-year':
				return 'priceChange1y';
			case 'price-quarter':
				return 'priceChange3m';
			case 'high-day-1':
				return 'stock_high_next_day1';
			case 'low-day-1':
				return 'stock_low_next_day1';
			case 'close-day-1':
				return 'stock_close_next_day1';
			case 'high-day-2':
				return 'stock_high_next_day2';
			case 'low-day-2':
				return 'stock_low_next_day2';
			case 'close-day-2':
				return 'stock_close_next_day2';
			case 'agv':
				return 'agv10';
			default:
				return 'stock_code';
		}
	}

	const handleFetchSort = function (column, type, filter = '') {
		let columnSort = handleColumnSort(column);
		fetch(urlAPI_Data, {
			method: 'POST',
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.length) {
					$('#chart-list').html('');

					if (filter !== '') {
						data = data.filter(elm => elm.stock_type === filter);
					} else {
						data = data;
					}

					let dataSorted;
					if (columnSort === 'stock_code') {
						dataSorted = handleSortString(data, columnSort, type);
					} else {
						dataSorted = handleSortNumber(data, columnSort, type);
					}
					let renderTemplateList = '';

					dataSorted.map(function (data) {
						renderTemplateList += renderTemplate(data);
					});

					$('#chart-list').append(renderTemplateList);

					$('.chart-table_sort').removeClass('chart-disabled');


				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	const handleSortData = function () {
		if ($('.chart-table_sort').length) {
			let chartSort = $('.chart-table_sort');
			chartSort.click(function () {
				let chartSort_elm = $(this), chartSort_elm_column = chartSort_elm.attr('data-sort');
				chartSort_elm.addClass('chart-disabled');

				let filter = ($('.chart-filter_item.active').length) ? $('.chart-filter_item.active').attr('data-value') : '';

				if (chartSort_elm.hasClass('chart-table_sort__up') === false && chartSort_elm.hasClass('chart-table_sort__down') === false) {
					chartSort.removeClass('chart-table_sort__up chart-table_sort__down');
					chartSort_elm.addClass('chart-table_sort__down');
					handleFetchSort(chartSort_elm_column, 'down', filter);
				} else if (chartSort_elm.hasClass('chart-table_sort__up') === false && chartSort_elm.hasClass('chart-table_sort__down') === true) {
					chartSort_elm.removeClass('chart-table_sort__down').addClass('chart-table_sort__up');
					handleFetchSort(chartSort_elm_column, 'up', filter);
				} else if (chartSort_elm.hasClass('chart-table_sort__up') === true && chartSort_elm.hasClass('chart-table_sort__down') === false) {
					chartSort_elm.removeClass('chart-table_sort__up');
					if (filter !== '') {
						handleFetchFilter(filter);
					} else {
						handleFetchData();
					}
				}
			});
		}
	}

	const handleFetchFilter = function (filter) {
		fetch(urlAPI_Data, {
			method: 'POST',
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.length) {
					$('#chart-list').html('');
					let renderTemplateList = '';

					data = data.filter(elm => elm.stock_type === filter);
					if (data.length > 0) {
						data.map(function (data) {
							renderTemplateList += renderTemplate(data);
						});
					} else {
						renderTemplateList += renderTemplateEmpty();
					}

					$('#chart-list').append(renderTemplateList);

					$('.chart-table_sort').removeClass('chart-table_sort__up chart-table_sort__down');


				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	const handleFilterData = function () {
		if ($('.chart-filter_item').length) {
			let chartFilter = $('.chart-filter_item');
			chartFilter.click(function () {
				let chartFilter_elm = $(this), chartFilter_type = chartFilter_elm.attr('data-value');
				if (chartFilter_elm.hasClass('active') === false) {

					if ($('.chart-table_sort').length) {
						$('.chart-table_sort').removeClass('data-value')
					}

					chartFilter.removeClass('active');
					chartFilter_elm.addClass('active');
					handleFetchFilter(chartFilter_type);
				} else {
					return false;
				}
			});
		}
	}

	const handleSearch = function (data) {
		if ($('#chartSearch').length) {
			let chartSearch = $('#chartSearch'), chartSearch_wrap = chartSearch.closest('.chart-search');
			chartSearch.keyup(function () {
				let chartSearch_elm = $(this), chartSearch_value = $.trim(chartSearch_elm.val());
				console.log(data)
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

	$(function () {
		handleFetchData(function (data) {
			handleSortData();
			handleFilterData();
			handleSearch(data);
			clearInterval(intervalPrice);
			intervalPrice = setInterval(function () {
				handleFetchPrice();
			}, timeFetchPrice);
		});

		handleSetPadding();
		$(window).resize(function () {
			windowWidth = $(window).width();
			handleSetMinWidth();
			handleSetPadding();
		});
	});
})
(jQuery);
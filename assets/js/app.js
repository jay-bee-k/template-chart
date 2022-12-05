;(function ($) {
	'use strict';
	const urlAPI_Info = 'https://wipomart.com/systeminfor.php';
	const urlAPI_Data = 'https://wipomart.com/main.php';
	const urlAPI_Price = 'https://wipomart.com/getprice.php';
	const timeFetchPrice = 8000;
	const timeFetchPriceTemp = 2000;
	let intervalPrice = '';
	let intervalPriceTemp = '';
	let intervalInfo = '';
	let isTemp = false;
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

	const formatPercent = function (value, fixed = 2) {
		return parseFloat(value).toFixed(fixed).replace(/\d(?=(\d{3})+\.)/g, '$&,');
	}

	const renderTemplate = function (data) {
		return `<div class="chart-table_row chart-table_border__row ${formatClass(parseInt(data.price_status))}" data-row="${data.stock_code}">
					<div class="chart-table_col chart-table_border__col chart-table_col__1 text-start justify-content-start">
						<span class="chart-table_text">
							${data.stock_code}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__2 text-center justify-content-center">
						<span class="chart-table_text">
							<a href="" class="chart-table_btn">View More</a>
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__2 text-end justify-content-end">
						<span class="chart-table_text chart-text_warning" data-price-pre> 
							${data.stock_pre_day1 !== null ? formatPercent(data.stock_pre_day1) : '---'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__2 text-end justify-content-end">
						<span class="chart-table_text" data-price> 
							${data.stock_price !== null ? formatPercent(data.stock_price) : '---'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__3 text-end justify-content-end chart-table_highlight">
						<span class="chart-table_text" data-percent>
							${data.changePercent !== null ? formatPercent(data.changePercent) + '%' : '---'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__4 text-end justify-content-end chart-table_highlight">
						<span class="chart-table_text">
							${data.pe !== null ? formatPercent(data.pe) + '%' : '---'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__5 text-end justify-content-end chart-table_highlight__2">
						<span class="chart-table_text">
							${data.eps !== null ? formatPercent(data.eps) + '%' : '---'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__6 text-end justify-content-end">
						<span class="chart-table_text">
							${data.yearRevenueGrowth !== null ? formatPercent(data.yearRevenueGrowth) + '%' : '---'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__7 text-end justify-content-end">
						<span class="chart-table_text">
							${data.quarterRevenueGrowth !== null ? formatPercent(data.quarterRevenueGrowth) + '%' : '---'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__8 text-end justify-content-end">
						<span class="chart-table_text">
							${data.deposit !== null ? formatPercent(data.deposit) : '---'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__9 text-end justify-content-end">
						<span class="chart-table_text">
							${data.revenue !== null ? formatPercent(data.revenue) : '---'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__10 text-end justify-content-end">
						<span class="chart-table_text">
							${data.priceChange1y !== null ? formatPercent(data.priceChange1y) + '%' : '---'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__11 text-end justify-content-end">
						<span class="chart-table_text">
							${data.priceChange3m !== null ? formatPercent(data.priceChange3m) + '%' : '---'}
						</span>
					</div>
					<div class="chart-table_body__group">
						<div class="chart-table_col chart-table_border__col chart-table_col__same text-end">
							<span class="chart-table_text">
								${data.stock_high_next_day1 !== null ? formatPercent(data.stock_high_next_day1) : '---'}
							</span>
						</div>
						<div class="chart-table_col chart-table_border__col chart-table_col__same text-end">
							<span class="chart-table_text">
								${data.stock_low_next_day1 !== null ? formatPercent(data.stock_low_next_day1) : '---'}
							</span>
						</div>
						<div class="chart-table_col chart-table_border__col chart-table_col__same text-end chart-table_highlight">
							<span class="chart-table_text">
								${data.stock_close_next_day1 !== null ? formatPercent(data.stock_close_next_day1) : '---'}
							</span>
						</div>
						<div class="chart-table_col chart-table_border__col chart-table_col__same text-end">
							<span class="chart-table_text">
								${data.stock_high_next_day2 !== null ? formatPercent(data.stock_high_next_day2) : '---'}
							</span>
						</div>
						<div class="chart-table_col chart-table_border__col chart-table_col__same text-end">
							<span class="chart-table_text">
								${data.stock_low_next_day2 !== null ? formatPercent(data.stock_low_next_day2) : '---'}
							</span>
						</div>
						<div class="chart-table_col chart-table_border__col chart-table_col__same text-end chart-table_highlight">
							<span class="chart-table_text">
								${data.stock_close_next_day2 !== null ? formatPercent(data.stock_close_next_day2) : '---'}
							</span>
						</div>
						<div class="chart-table_col__group___last d-flex">
							<div class="chart-table_col chart-table_border__col chart-table_col__99 text-end chart-table_highlight">
								<span class="chart-table_text">
								---
								</span>
							</div>
							<div class="chart-table_col chart-table_border__col chart-table_col__100 text-end chart-table_highlight">
								<span class="chart-table_text">
									---
								</span>
							</div>
						</div>
					</div>
				</div>`;
	}

	const renderTemplateEmpty = function () {
		return '<div class="chart-table_row chart-table_border__row"><div class="chart-table chart-table_col chart-table_col__empty text-center w-100">Không có dữ liệu phù hợp</div></div>';
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

	const handleFetchInfo = function (callBack) {
		fetch(urlAPI_Info, {
			method: 'POST',
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.length) {
					data = data[0];
					let classStatus = (data.change_score > 0) ? 'chart-text_success' : 'chart-text_danger';
					$('.chart-stock').html(data.vn_index + '&nbsp;' + data.change_score + '&nbsp;(' + data.change_percent + '%)').addClass(classStatus);
					$('.chart-view').html(data.view_count);
					$('#chart-day_1').html(data.next_day1);
					$('#chart-day_2').html(data.next_day2);
					$('#chart-month').html(data.next_month);

					if (callBack) {
						callBack();
					}
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	let i = 0;
	const handleFetchPrice = function () {
		let isPriceSame = false;
		let isChangeSame = false;
		fetch(urlAPI_Price, {
			method: 'POST',
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.length) {
					i++;
					data.map(function (data) {
						let rowChange = $('.chart-table_row[data-row="' + data.stock_code + '"]');
						if (rowChange.length) {
							let rowPrice = rowChange.find('.chart-table_text[data-price]');
							let rowPercent = rowChange.find('.chart-table_text[data-percent]');

							rowChange.removeClass(function (index, className) {
								return (className.match(/(^|\s)chart-text_\S+/g) || []).join(' ');
							}).addClass(formatClass(parseInt(data.price_status)));

							if (data.stock_price === null) {
								rowPrice.attr({
									'data-temp2': '---'
								});
							} else {
								if (parseFloat(rowPrice.attr('data-temp1')) == parseFloat(data.stock_price)) {
									rowPrice.attr({
										'data-temp1': parseFloat(data.stock_price),
										'data-temp2': parseFloat(data.stock_price) + 0.1
									});
									isPriceSame = true;
								} else {
									if (parseFloat(rowPrice.attr('data-temp2')) != parseFloat(data.stock_price)) {
										rowPrice.attr({
											'data-temp3': parseFloat(rowPrice.attr('data-temp2')),
										});
									}
									rowPrice.attr({
										'data-temp2': parseFloat(data.stock_price),
									});
								}
							}

							if (data.changePercent === null) {
								rowPercent.attr({
									'data-temp2': '---'
								});
							} else {
								if (parseFloat(rowPercent.attr('data-temp1')) == parseFloat(data.changePercent)) {
									rowPercent.attr({
										'data-temp1': parseFloat(data.changePercent),
										'data-temp2': parseFloat(data.changePercent) + 0.1
									});
									isChangeSame = true;
								} else {
									if (parseFloat(rowPercent.attr('data-temp2')) != parseFloat(data.changePercent)) {
										rowPercent.attr({
											'data-temp3': parseFloat(rowPercent.attr('data-temp2')),
										});
									}
									rowPercent.attr({
										'data-temp2': parseFloat(data.changePercent),
									});
								}
							}

							if (isPriceSame) {
								rowPrice.html(formatPercent(parseFloat(rowPrice.attr('data-temp1'))));
								rowPrice.attr('data-temp2', formatPercent(parseFloat(rowPrice.attr('data-temp2'))));
							} else {
								if (i > 1 && parseFloat(rowPrice.attr('data-temp1')) != parseFloat(rowPrice.attr('data-temp2'))) {
									rowPrice.attr('data-temp1', formatPercentparseFloat(rowPrice.attr('data-temp3')));
								}
								rowPrice.html(formatPercent(parseFloat(rowPrice.attr('data-temp2'))));

							}

							if (isChangeSame) {
								rowPercent.html(formatPercent(parseFloat(rowPercent.attr('data-temp1'))) + '%');
								rowPercent.attr('data-temp2', formatPercent(parseFloat(rowPercent.attr('data-temp2'))));
							} else {
								if (i > 1 && parseFloat(rowPercent.attr('data-temp1')) != parseFloat(rowPercent.attr('data-temp2'))) {
									rowPercent.attr('data-temp1', formatPercent(parseFloat(rowPercent.attr('data-temp3'))));
								}
								rowPercent.html(formatPercent(parseFloat(rowPercent.attr('data-temp2'))) + '%');
							}
						}
					});

					isTemp = false;
					clearInterval(intervalPriceTemp);
					intervalPriceTemp = setInterval(function () {
						handlePriceTemp(data, true, i);
					}, timeFetchPriceTemp);
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	const handleFetchData = function (callBack) {
		fetch(urlAPI_Data, {
			method: 'POST',
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.length) {
					$('#chart-list').html('');
					let renderTemplateList = '';
					let arrTemp = [];
					data.map(function (data, index) {
						renderTemplateList += renderTemplate(data);
						arrTemp[index] = {
							'stock_code': data.stock_code,
							'stock_price': data.stock_price,
							'changePercent': data.changePercent
						};
					});

					$('#chart-list').append(renderTemplateList);

					$('.chart-table_sort').removeClass('chart-disabled');
					handleSetMinWidth();

					clearInterval(intervalPriceTemp);
					intervalPriceTemp = setInterval(function () {
						handlePriceTemp(arrTemp);
					}, timeFetchPriceTemp);

					if (callBack) {
						callBack(data, arrTemp);
					}
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	const handlePriceTemp = function (dataTemp, isFetch = false, i = 0) {
		dataTemp.map(function (data) {
			let rowChange = $('.chart-table_row[data-row="' + data.stock_code + '"]');
			if (rowChange.length) {
				let rowPrice = rowChange.find('.chart-table_text[data-price]');
				let rowPercent = rowChange.find('.chart-table_text[data-percent]');

				if (!isFetch) {
					if (data.stock_price === null) {
						rowPrice.attr({
							'data-temp1': '---', 'data-temp2': '---'
						});
					} else {
						rowPrice.attr({
							'data-temp1': data.stock_price,
							'data-temp2': formatPercent(parseFloat(data.stock_price) + 0.1)
						});
					}
					if (data.changePercent === null) {
						rowPercent.attr({
							'data-temp1': '---', 'data-temp2': '---'
						});
					} else {
						rowPercent.attr({
							'data-temp1': data.changePercent,
							'data-temp2': formatPercent(parseFloat(data.changePercent) + 0.1)
						});
					}
				}

				if (!isTemp) {
					rowPrice.html(rowPrice.attr('data-temp2'));
					rowPercent.html(rowPercent.attr('data-temp2') !== '---' ? formatPercent(parseFloat(rowPercent.attr('data-temp2'))) + '%' : 0);
				} else {
					rowPrice.html(rowPrice.attr('data-temp1'));
					rowPercent.html(rowPercent.attr('data-temp1') !== '---' ? formatPercent(parseFloat(rowPercent.attr('data-temp1'))) + '%' : 0);
				}
			}
		});
		isTemp = !isTemp;
	}

	const handleColumnSort = function (column) {
		switch (column) {
			case 'price-pre':
				return 'stock_pre_day1';
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
					let arrTemp = [];
					dataSorted.map(function (data, index) {
						renderTemplateList += renderTemplate(data);
						arrTemp[index] = {
							'stock_code': data.stock_code,
							'stock_price': data.stock_price,
							'changePercent': data.changePercent
						};
					});

					$('#chart-list').append(renderTemplateList);

					$('.chart-table_sort').removeClass('chart-disabled');

					clearInterval(intervalPriceTemp);
					intervalPriceTemp = setInterval(function () {
						handlePriceTemp(arrTemp);
					}, timeFetchPriceTemp);
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
						let arrTemp = [];
						data.map(function (data, index) {
							renderTemplateList += renderTemplate(data);
							arrTemp[index] = {
								'stock_code': data.stock_code,
								'stock_price': data.stock_price,
								'changePercent': data.changePercent
							};
						});

						clearInterval(intervalPriceTemp);
						intervalPriceTemp = setInterval(function () {
							handlePriceTemp(arrTemp);
						}, timeFetchPriceTemp);
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

	const handleSearch = function () {
		if ($('#chartSearch').length) {
			let chartSearch = $('#chartSearch'), chartSearch_wrap = chartSearch.closest('.chart-search');
			chartSearch.keyup(function () {
				let chartSearch_elm = $(this), chartSearch_value = $.trim(chartSearch_elm.val()).toUpperCase();
				if (chartSearch_value.length > 0) {
					chartSearch_wrap.addClass('is-show');

					handleFetchData(function (data) {
						let renderTemplateSearch = '';
						data = data.filter(elm => Object.values(elm.stock_code).some(val => val.includes(chartSearch_value)));
						if (data.length > 0) {
							data.map(function (data) {
								renderTemplateSearch += `<li>
															<a href="javascript:void(0)">
																${data.stock_code}
															</a>
														</li>`;
							});
						} else {
							renderTemplateSearch = `<li>
															<a href="javascript:void(0)">
																Không tìm thấy mã CK
															</a>
														</li>`;
						}

						$('#chart-search_fill').html(renderTemplateSearch);
					});
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
		handleFetchInfo(function () {
			clearInterval(intervalInfo);
			intervalInfo = setInterval(function () {
				handleFetchInfo();
			}, timeFetchPrice);
		});

		handleFetchData(function (data, arrTemp) {
			handleSortData();
			handleFilterData();
			handleSearch();

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
})(jQuery);
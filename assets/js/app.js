;(function ($) {
	'use strict';
	const urlAPI_Info = 'https://vinavote.com/systeminfor.php';
	const urlAPI_DJIndex = 'https://vinavote.com/dj_index.php';
	const urlAPI_Data = 'https://vinavote.com/main.php';
	const urlAPI_Price = 'https://vinavote.com/getprice.php';
	const urlAPI_TopTangGia = 'https://vinavote.com/getvol.php';
	const urlAPI_KhoiNgoai = 'https://vinavote.com/fore.php';
	const urlAPI_Subscribe = 'https://vinavote.com/postmail.php';
	const urlAPI_News = 'https://vinavote.com/news.php';
	const urlAPI_ListNews = 'https://vinavote.com/getlist.php';
	const urlAPI_DetailNews = 'https://vinavote.com/getnew.php?id=';
	const timeFetchPrice = 20000;
	const timeFetchPriceTemp = 4000;
	const timeFetchNews = 7200000;
	let intervalPrice = '';
	let intervalPriceTemp = '';
	let intervalInfo = '';
	let intervalDJIndex = '';
	let intervalFetchNews = '';
	let isTemp = false;
	let windowWidth = $(window).width();

	let handleSetMinWidth = function () {
		if (windowWidth < 1280 && $('.chart-table_row').length) {
			$('.chart-body').each(function () {
				let rowWidth = 0;
				let body = $(this);
				if (body.find('.chart-table').hasClass('chart-table_small') == false) {
					body.find('.chart-table_header').css('width', '1900px');
					body.find('.chart-table_body').css('width', '1900px');
				} else {
					body.find('.chart-table_row').each(function () {
						if ($(this)[0].scrollWidth > rowWidth) {
							rowWidth = $(this)[0].scrollWidth;
							if ($(this)[0].scrollWidth > rowWidth) {
								rowWidth = $(this)[0].scrollWidth;
							}
						}
					});
					body.find('.chart-table_header').css('width', 'calc(100% + 400px)');
					body.find('.chart-table_body').css('width', 'calc(100% + 400px)');
				}
			})
		} else {
			$('.chart-table_body, .chart-table_header').css('width', '100%');
		}
	}

	let handleSetPadding = function () {
		$('.chart-table').each(function () {
			if ($(this).find('.chart-table_header').length) {
				$(this).find('.chart-table_header').each(function () {
					let row = $(this), rowHeight = row.outerHeight(), headerHeight = $('#header').outerHeight(),
						actionHeight = $('#chart-action').outerHeight(),
						textHeight = $('#chart-text').outerHeight();
					if (windowWidth >= 1280) {
						row.parents('.chart-body').css('padding-top', actionHeight + rowHeight);
					} else if (windowWidth >= 992 && windowWidth < 1280) {
						row.parents('.chart-body').css('padding-top', actionHeight);
					} else {
						row.parents('.chart-body').css('padding-top', actionHeight + textHeight + 40);
						$('#chart-action').css('top', headerHeight + 5);
						$('#chart-text').css('top', headerHeight + actionHeight + 5);
					}
				})
			}
		});
	}

	let handleSetPaddingNews = function () {
		if ($('#chart-news').length > 0) {
			let actionHeight = $('#chart-action').outerHeight(), textHeight = $('#chart-text').outerHeight();

			if (windowWidth >= 992) {
				$('#chart-news.chart-body').css('padding-top', actionHeight + 10);
			} else {
				$('#chart-news.chart-body').css('padding-top', actionHeight + textHeight + 10);
			}
		}
	}

	let handleSetHeightColumn = function () {
		if (windowWidth < 768) {
			if ($('.chart-table:visible').length) {
				let elmHeaderHeight = 0;
				$('.chart-table:visible .chart-table_header .chart-table_col').each(function () {
					let elm = $(this)[0];
					setTimeout(function () {
						let computedStyle = getComputedStyle(elm);
						let elementHeight = elm.clientHeight;
						elementHeight -= parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
						if (elementHeight > elmHeaderHeight) {
							elmHeaderHeight = elementHeight;
						}
						if ($(elm).closest('.chart-table_col__group').length == 0) {
							$(elm).css('min-height', elementHeight);
						} else {
							$(elm).css('min-height', elmHeaderHeight / 3);
						}
						$(elm).parents('.chart-table_header').css('min-height', elmHeaderHeight);
					}, 250);
				});
			}
		}
	}

	const formatPrice = function (value) {
		return value.replace(/[^0-9]/g, '').toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	const formatPercent = function (value, fixed = 2) {
		return parseFloat(value).toFixed(fixed).replace(/\d(?=(\d{3})+\.)/g, '$&,');
	}

	const renderTemplate = function (data) {
		return `<div class="chart-table_row chart-table_border__row ${formatClass(parseInt(data.price_status))}" data-row="${data.stock_code}">
					<div class="chart-table_col chart-table_border__col chart-table_col__14 text-center justify-content-center">
						<span class="chart-table_text">
							<a href="javascript:void(0)" data-code="${data.stock_code}" class="chart-table_btn chart-detail_code">View More</a>
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__1 text-start justify-content-start">
						<span class="chart-table_text">
							${data.stock_code}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__2 text-end justify-content-end chart-table_highlight">
						<span class="chart-table_text chart-text_warning" data-price-pre> 
							${data.stock_pre_day1 !== null ? formatPercent(data.stock_pre_day1 / 1000) : '---'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__2 text-end justify-content-end chart-table_highlight">
						<span class="chart-table_text" data-price> 
							${data.stock_price !== null ? formatPercent(data.stock_price) : '---'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__3 text-end justify-content-end chart-table_highlight">
						<span class="chart-table_text" data-percent>
							${data.changePercent !== null ? formatPercent(data.changePercent) + '%' : '---'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__3 text-end justify-content-end chart-table_highlight">
						<span class="chart-table_text" data-volume>
							${data.volume !== null ? formatPrice(data.volume) : '---'} 
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__4 text-end justify-content-end">
						<span class="chart-table_text">
							${data.pe !== null ? formatPercent(data.pe) : '---'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__5 text-end justify-content-end">
						<span class="chart-table_text">
							${data.eps !== null ? formatPercent(data.eps) : '---'}
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
						<div class="chart-table_col__group___last d-flex">
							<div class="chart-table_col chart-table_border__col chart-table_col__99 chart-table_col__getWidth text-end chart-table_highlight" data-col="4">
								<span class="chart-table_text">
									${data.close_month1 !== null ? formatPercent(data.close_month1) : '---'}
								</span>
							</div>
							<div class="chart-table_col chart-table_col__100 chart-table_col__getWidth text-end chart-table_highlight" data-col="5">
								<span class="chart-table_text">
									${data.change_month1 !== null ? formatPercent(data.change_month1) + '%' : '---'}
								</span>
							</div>
						</div>
						<div class="chart-table_col__group___last chart-table_col__pseudo d-flex">
							<div class="chart-table_col chart-table_border__col chart-table_col__99 chart-table_col__getWidth text-end chart-table_highlight" data-col="6">
								<span class="chart-table_text">
									${data.close_month2 !== null ? formatPercent(data.close_month2) : '---'}
								</span>
							</div>
							<div class="chart-table_col chart-table_border__col chart-table_col__100 chart-table_col__getWidth text-end chart-table_highlight" data-col="7">
								<span class="chart-table_text">
									${data.change_month2 !== null ? formatPercent(data.change_month2) + '%' : '---'}
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
							'changePercent': data.changePercent,
							'volume': data.volume
						};
					});

					$('#chart-list').append(renderTemplateList);

					$('.chart-table_sort').removeClass('chart-disabled');
					handleSetMinWidth();
					handleSetColWidth();

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
				setTimeout(function () {
					handleFetchData()
				}, timeFetchPrice)
			});
	}

	let i = 0;
	const handleFetchPrice = function () {
		let isPriceSame = false;
		let isChangeSame = false;
		if (timeStatus) {
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
											'data-temp1': formatPercent(parseFloat(data.stock_price)),
											'data-temp2': formatPercent(parseFloat(data.stock_price) + 0.1)
										});
										isPriceSame = true;
									} else {
										if (parseFloat(rowPrice.attr('data-temp2')) != parseFloat(data.stock_price)) {
											rowPrice.attr({
												'data-temp3': rowPrice.attr('data-temp2'),
											});
										}
										rowPrice.attr({
											'data-temp2': formatPercent(parseFloat(data.stock_price)),
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
											'data-temp1': formatPercent(parseFloat(data.changePercent)),
											'data-temp2': formatPercent(parseFloat(data.changePercent) + 0.1)
										});
										isChangeSame = true;
									} else {
										if (parseFloat(rowPercent.attr('data-temp2')) != parseFloat(data.changePercent)) {
											rowPercent.attr({
												'data-temp3': rowPercent.attr('data-temp2')
											});
										}
										rowPercent.attr({
											'data-temp2': formatPercent(parseFloat(data.changePercent))
										});
									}
								}

								if (isPriceSame) {
									rowPrice.html(formatPercent(parseFloat(rowPrice.attr('data-temp1'))));
									rowPrice.attr('data-temp2', formatPercent(parseFloat(rowPrice.attr('data-temp2'))));
								} else {
									if (i > 1 && parseFloat(rowPrice.attr('data-temp1')) != parseFloat(rowPrice.attr('data-temp2'))) {
										rowPrice.attr('data-temp1', formatPercent(parseFloat(rowPrice.attr('data-temp3'))));
									}
									rowPrice.html(rowPrice.attr('data-temp2'));

								}

								if (isChangeSame) {
									rowPercent.html(formatPercent(parseFloat(rowPercent.attr('data-temp1'))) + '%');
									rowPercent.attr('data-temp2', formatPercent(parseFloat(rowPercent.attr('data-temp2'))));
								} else {
									if (i > 1 && parseFloat(rowPercent.attr('data-temp1')) != parseFloat(rowPercent.attr('data-temp2'))) {
										rowPercent.attr('data-temp1', formatPercent(parseFloat(rowPercent.attr('data-temp3'))));
									}
									rowPercent.html(rowPercent.attr('data-temp2') + '%');
								}

								handleHighLightPrice(rowPrice, parseFloat(rowPrice.attr('data-temp2')), parseFloat(rowPrice.html()));
								handleHighLightPrice(rowPercent, parseFloat(rowPercent.attr('data-temp2')), parseFloat(rowPercent.html()));
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
					setTimeout(function () {
						handleFetchPrice()
					}, timeFetchPrice)
				});
		}
	}

	const handlePriceTemp = function (dataTemp, isFetch = false, i = 0) {
		if (timeStatus) {
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
								'data-temp1': formatPercent(parseFloat(data.stock_price)),
								'data-temp2': formatPercent(parseFloat(data.stock_price) + 0.1)
							});
						}
						if (data.changePercent === null) {
							rowPercent.attr({
								'data-temp1': '---', 'data-temp2': '---'
							});
						} else {
							rowPercent.attr({
								'data-temp1': formatPercent(parseFloat(data.changePercent)),
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

					handleHighLightPrice(rowPrice, parseFloat(rowPrice.attr('data-temp2')), parseFloat(rowPrice.html()));
					handleHighLightPrice(rowPercent, parseFloat(rowPercent.attr('data-temp2')), parseFloat(rowPercent.html()));
				}
			});
			isTemp = !isTemp;
		}
	}

	const handleHighLightPrice = function (column, price_first, price_second) {
		let highLightPrice = 'chart-highlight_success';
		if (price_first === price_second) {
			highLightPrice = 'chart-highlight_success';
		} else if (price_first > price_second) {
			highLightPrice = 'chart-highlight_danger';
		}

		column.parent().addClass(highLightPrice);
		setTimeout(function () {
			column.parent().removeClass(highLightPrice);
		}, 1000)
	}

	let timeStatus = false;
	const handleFetchInfo = function (callBack) {
		fetch(urlAPI_Info, {
			method: 'POST',
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.length) {
					data = data[0];
					let classStatus = (data.change_score > 0) ? 'chart-text_success' : 'chart-text_danger';
					$('.chart-stock_vn').html(data.vn_index + '&nbsp;' + formatPercent(parseFloat(data.change_score)) + '&nbsp;(' + formatPercent(parseFloat(data.change_percent), 3) + '%)').addClass(classStatus);
					$('.chart-view').html(formatPrice(data.view_count.toString()));
					$('#chart-month_1').html(`${data.next_month1} <br/>`);
					$('#chart-month_2').html(`${data.next_month2} <br/>`);

					if (parseInt(data.active) === 1) {
						timeStatus = true;
					} else {
						timeStatus = false;
					}

					if (callBack) {
						callBack();
					}
				}
			})
			.catch((error) => {
				setTimeout(function () {
					handleFetchInfo()
				}, timeFetchPrice)
			});
	}

	const handleFetchDJIndex = function (callBack) {
		fetch(urlAPI_DJIndex, {
			method: 'POST',
		})
			.then((response) => response.json())
			.then((data) => {
				let classStatus = (data.change_score > 0) ? 'chart-text_success' : 'chart-text_danger';
				$('.chart-stock_dj').html(formatPercent(parseFloat(data.dj_index)) + '&nbsp;' + formatPercent(parseFloat(data.change_score)) + '&nbsp;(' + formatPercent(parseFloat(data.percent), 3) + '%)').addClass(classStatus);

				if (callBack) {
					callBack();
				}
			})
			.catch((error) => {
				setTimeout(function () {
					handleFetchDJIndex()
				}, timeFetchPrice)
			});
	}

	const handleColumnSort = function (column) {
		switch (column) {
			case 'price-pre':
				return 'stock_pre_day1';
			case 'price':
				return 'stock_price';
			case 'change':
				return 'changePercent';
			case 'volume':
				return 'volume';
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
			case 'change_month1':
				return 'change_month1';
			case 'close_month1':
				return 'close_month1';
			case 'change_month2':
				return 'change_month2';
			case 'close_month2':
				return 'close_month2';
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

					if (filter !== '' && filter > -1) {
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
							'changePercent': data.changePercent,
						};
					});

					$('#chart-list').append(renderTemplateList);

					$('.chart-table_sort').removeClass('chart-disabled');

					handleChartModal();
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
					if (!isNaN(parseInt(filter)) && parseInt(filter) > 0) {
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
								'changePercent': data.changePercent,
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
					handleChartModal();
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	const handleFilterData = function () {
		if ($('.chart-filter_call').length) {
			let chartFilter = $('.chart-filter_call');
			chartFilter.click(function () {
				let chartFilter_elm = $(this), chartFilter_type = chartFilter_elm.attr('data-value');
				if (chartFilter_elm.hasClass('active') === false) {
					if ($('.chart-table_sort').length) {
						$('.chart-table_sort').removeClass('data-value')
					}

					chartFilter.parent().find('.chart-filter_item').removeClass('active');
					chartFilter_elm.addClass('active');
					if (!isNaN(parseInt(chartFilter_type)) && parseInt(chartFilter_type) > 0) {
						handleFetchFilter(chartFilter_type);
					} else {
						handleFetchData();
					}

					$('#header, #chart-action, #chart-text').removeClass('position-static pt-1');
					$('#chart-main').removeClass('py-0');
					$('#chart-news').removeClass('py-2');
					$('#chart-main .chart-body').removeClass('is-show');
					$('#chart-table').addClass('is-show');
					handleSetPadding();
					handleSetMinWidth();
				} else {
					return false;
				}
			});
		}
	}

	const handleCallTab = function () {
		if ($('.chart-tab_call').length) {
			let chartTab = $('.chart-tab_call');
			chartTab.click(function () {
				let chartTab_elm = $(this), chartTab_type = chartTab_elm.attr('data-target');
				if (chartTab_elm.hasClass('active') === false) {
					chartTab_elm.parent().find('.chart-filter_item').removeClass('active');
					chartTab_elm.addClass('active');
					$('#chart-main .chart-body').removeClass('is-show');
					$('#chart-table #chart-list').html('');
					$(chartTab_type).addClass('is-show');
					if (chartTab_type === '#chart-news') {
						$('#header, #chart-action, #chart-text').addClass('position-static pt-1');
						$('#chart-main').addClass('py-0');
						$('#chart-news').addClass('py-2');
						handleSetPaddingNews();
					} else {
						$('#header, #chart-action, #chart-text').removeClass('position-static pt-1');
						$('#chart-main').removeClass('py-0');
						$('#chart-news').removeClass('py-2');
						handleSetPadding();
					}
					handleSetMinWidth();
					handleSetHeightColumn();
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
						let resultSearch = [];

						resultSearch = data.filter(function (elm) {
							return elm.stock_code.includes(chartSearch_value)
						});
						if (resultSearch.length > 0) {
							resultSearch.map(function (data) {
								renderTemplateSearch += `<li>
															<a href="javascript:void(0)" class="chart-search_item" data-code="${data.stock_code}">
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

						handleSearchResult();
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

	const handleSearchResult = function () {
		let searchItem = $('.chart-search_item');
		if (searchItem.length) {
			searchItem.click(function () {
				let search_elm = $(this), search_value = search_elm.attr('data-code');


				let chartSearch = $('#chartSearch'), chartSearch_wrap = chartSearch.closest('.chart-search');

				fetch(urlAPI_Data, {
					method: 'POST',
				})
					.then((response) => response.json())
					.then((data) => {
						if (data.length) {
							$('#chart-list').html('');
							let renderTemplateList = '';

							data = data.filter(elm => elm.stock_code === search_value);
							if (data.length > 0) {
								let arrTemp = [];
								data.map(function (data, index) {
									renderTemplateList += renderTemplate(data);
									arrTemp[index] = {
										'stock_code': data.stock_code,
										'stock_price': data.stock_price,
										'changePercent': data.changePercent,
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
							chartSearch_wrap.removeClass('is-show');

							$('.chart-table_sort').removeClass('chart-table_sort__up chart-table_sort__down');
							handleChartModal();
						}
					})
					.catch((error) => {
						console.log(error);
					});
			});
		}
	}

	const handleChartModal = function () {
		let chartModal = $('#chart-modal');
		$('.chart-detail_code').click(function () {
			let chartCode = $(this).attr('data-code');
			$('.chart-detail_code').css('pointer-events', 'none');
			if (chartCode.length) {
				fetch(urlAPI_Data, {
					method: 'POST',
				})
					.then((response) => response.json())
					.then((data) => {
						if (data.length) {
							data = data.filter(elm => elm.stock_code === chartCode);
							if (chartModal.length) {
								chartModal.find('#chart-modal_code').text(data[0].stock_code);
								if (data[0].comment !== null) {
									chartModal.find('#chart-modal_comment').html(data[0].comment.replace(/\n/g, "<br>"));
								}
								chartModal.modal('show');
								$('.chart-detail_code').css('pointer-events', 'auto');
							}
						}
					})
					.catch((error) => {
						setTimeout(function () {
							location.reload();
						}, 3000)
					});
			}
		});

		chartModal.on('hidden.bs.modal', function () {
			chartModal.find('#chart-modal_code').text('');
			chartModal.find('#chart-modal_comment').text('');
		});
	}

	let renderTemplateTangGia = function (data) {
		return `<div class="chart-table_row chart-table_border__row">
					<div class="chart-table_col chart-table_border__col chart-table_col__same text-center justify-content-center">
						<span class="chart-table_text">
							${data.company_name}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__same text-center justify-content-center">
						<span class="chart-table_text">
							${data.stock_code}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__same text-center justify-content-center">
						<span class="chart-table_text">
							${data.total_volume !== null ? formatPrice(formatPercent(parseFloat(data.total_volume), 0)) : '---'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__same text-center justify-content-center">
						<span class="chart-table_text">
							${data.total_value !== null ? formatPrice(formatPercent(parseFloat(data.total_value), 0)) : '---'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__same text-center justify-content-center">
						<span class="chart-table_text">
							${data.change_percent !== null ? formatPercent(data.change_percent) + '%' : '---'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__same text-center justify-content-center">
						<span class="chart-table_text">
							${data.close_price !== null ? formatPercent(data.close_price) : '---'}
						</span>
					</div>
				</div>`
	}

	const handleFetchTopTangGia = function () {
		fetch(urlAPI_TopTangGia, {
			method: 'POST',
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.length) {
					$('#chart-list_tanggia').html('');
					let renderTemplateList = '';
					data.map(function (data) {
						renderTemplateList += renderTemplateTangGia(data);
					});

					$('#chart-list_tanggia').append(renderTemplateList);

					handleSetMinWidth();
				}
			})
			.catch((error) => {
				setTimeout(function () {
					handleFetchTopTangGia()
				}, timeFetchPrice)
			});
	}

	let renderTemplateKhoiNgoai = function (data) {
		return `<div class="chart-table_row chart-table_border__row">
					<div class="chart-table_col chart-table_border__col chart-table_col__same text-center justify-content-center">
						<span class="chart-table_text">
							${data.company_name}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__same text-center justify-content-center">
						<span class="chart-table_text">
							${data.stock_code}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__same text-center justify-content-center">
						<span class="chart-table_text">
							${data.buy_volume !== null ? formatPrice(formatPercent(parseFloat(data.buy_volume), 0)) : '---'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__same text-center justify-content-center">
						<span class="chart-table_text">
							${data.buy_value !== null ? formatPrice(formatPercent(parseFloat(data.buy_value), 0)) : '---'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__same text-center justify-content-center">
						<span class="chart-table_text">
							${data.sale_volume !== null ? formatPrice(formatPercent(parseFloat(data.sale_volume), 0)) : '---'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__same text-center justify-content-center">
						<span class="chart-table_text">
							${data.sale_value !== null ? formatPrice(formatPercent(parseFloat(data.sale_value), 0)) : '---'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__same text-center justify-content-center">
						<span class="chart-table_text">
							${data.change_percent !== null ? formatPercent(data.change_percent) + '%' : '---'}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__same text-center justify-content-center">
						<span class="chart-table_text">
							${data.close_price !== null ? formatPercent(data.close_price) : '---'}
						</span>
					</div>
				</div>`
	}

	const handleFetchKhoiNgoai = function () {
		fetch(urlAPI_KhoiNgoai, {
			method: 'POST',
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.length) {
					$('#chart-list_khoingoai').html('');
					let renderTemplateList = '';
					data.map(function (data) {
						renderTemplateList += renderTemplateKhoiNgoai(data);
					});

					$('#chart-list_khoingoai').append(renderTemplateList);

					handleSetMinWidth();
				}
			})
			.catch((error) => {
				setTimeout(function () {
					handleFetchTopTangGia()
				}, timeFetchPrice)
			});
	}

	const handleSetColWidth = function () {
		if ($('.chart-table_col__setWidth').length) {
			$('.chart-table_col__setWidth').each(function (index) {
				let getWidth = $(this).outerWidth();
				if (windowWidth > 1600) {
					$('.chart-table_col__getWidth[data-col=' + $(this).attr('data-col') + ']').css({
						'min-width': (index === 6) ? getWidth + 1 : getWidth,
						'max-width': (index === 6) ? getWidth + 1 : getWidth,
					});
				}
			});
		}
	}

	const handleFetchNews = function (callBack) {
		if ($('#chart-floating').length) {
			let chartFloatingContent = $('#chart-floating .content-list');

			fetch(urlAPI_News, {
				method: 'POST',
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.length) {
						chartFloatingContent.html('');
						let renderTemplateNews = '';

						if (data.length > 0) {
							data.map(function (data, index) {
								let dataRender = data.new.split("---");
								renderTemplateNews += `<div class="content-list_item">
															<div class="content-item_title">
																${dataRender[1]}
															</div>
															<div class="content-item_text">
																${dataRender[0].trim()}
															</div>
														</div>`;
							});

							chartFloatingContent.html(renderTemplateNews);

							handleInitSlick(chartFloatingContent);

							if (callBack) {
								callBack(chartFloatingContent)
							}
						}
					} else {
						$('#chart-floating').remove();
					}
				})
				.catch((error) => {
					$('#chart-floating').remove();
					console.log(error);
				});
		}
	}

	const handleVisiableNews = function (chartFloatingContent) {
		if (windowWidth < 991) {
			$('#call-floating').click(function () {
				if ($('#chart-floating').hasClass('is-hidden')) {
					handleInitSlick(chartFloatingContent);
					$('#chart-floating').removeClass('is-hidden');
				} else {
					chartFloatingContent.slick('unslick');
					$('#chart-floating').addClass('is-hidden');
				}
			});
		}
	}
	const handleToggleNews = function (chartFloatingContent) {
		if (windowWidth >= 992) {
			$('#toggle-floating').click(function () {
				if ($('#chart-floating').hasClass('is-toggle')) {
					handleInitSlick(chartFloatingContent);
					$('#chart-floating').removeClass('is-toggle');
				} else {
					chartFloatingContent.slick('unslick');
					$('#chart-floating').addClass('is-toggle');
				}
			});
		}
	}

	let listNewsArr = [];
	let limitPage = 15;
	let totalItem;
	let totalPage;
	const handleFetchListNews = function (page = 1) {
		if ($('#chart-news').length) {

			fetch(urlAPI_ListNews, {
				method: 'POST',
			})
				.then((response) => response.json())
				.then((data) => {
					if (data.length) {
						listNewsArr = data;
						totalItem = listNewsArr.length;
						totalPage = (totalItem == 0) ? 1 : Math.ceil(totalItem / limitPage);
						handleManageListNews(page, totalItem, totalPage, limitPage);
						if (totalPage > 1) {
							handlePagination();
						}
					}
				})
				.catch((error) => {
					console.log(error);
				});
		}
	}

	const handleManageListNews = function (page = 1, totalItem, totalPage, limitPage) {
		let renderTemplateCardNews = '';
		let startItem = (page == 1) ? 0 : (page - 1) * limitPage;

		listNewsArr.map(function (data, index) {
			if (index >= startItem && index < (limitPage * page)) {
				renderTemplateCardNews += `<div class="col">
															<div class="card-news card">
																<div class="card-header position-relative overflow-hidden border-0 bg-transparent p-0">
																	<div class="ratio ratio-16x9">
																		<img src="https://vinavote.com/${data.img}"
																		     class="img-fluid w-100 object-fit-cover" alt="${data.title}">
																	</div>
																	<a href="./detail.html?post=${data.id}" class="stretched-link"></a>
																</div>
																<div class="card-body">
																	<div class="card-date"><i class="fas fa-calendar-alt"></i> 
																		<span>Ngày đăng:</span>
																		${moment(data.dt).format('DD/MM/YYYY')}
																	</div>
																	<div class="card-title">
																		<a href="./detail.html?post=${data.id}">
																			<span>
																				${data.title}
																			</span>
																		</a>
																	</div>
																	<div class="card-desc">
																		${data.content}
																	</div>
																	<div class="card-button">
																		<a href="./detail.html?post=${data.id}" class="=card-button_link">Xem chi tiết <i class="fal fa-angle-right"></i></a>
																	</div>
																</div>
															</div>
														</div>`;
			}
		});
		$('#returnListNews').html(renderTemplateCardNews);
		if (totalItem > limitPage) {
			$('#returnListNews').parent().find('#pagination').html(`${handleRenderPagination(totalPage, page)}</ul></div>`)
		}
	}

	const handlePagination = function () {
		if ($('#pagination').length) {
			$(document).on('click', '#pagination .page-link', function () {
				if ($(this).hasClass('pageactive')) {
					return false;
				} else {
					$('#pagination .page-link').removeClass('pageactive');
					$(this).addClass('pageactive')
					handleManageListNews($(this).attr('data-page'), totalItem, totalPage, limitPage, false);
				}
			});
		}
	}

	const handleRenderPagination = function (total, current_page) {
		let cur_page = parseInt(current_page);
		let total_page = parseInt(total);
		let current_range = new Array();
		let start = cur_page - 2;
		let end = cur_page + 2;

		if (cur_page - 2 < 1) {
			start = 1;
		}
		if (cur_page + 2 > total_page) {
			end = total_page;
		}

		current_range[0] = start;
		current_range[1] = end;

		let first_page = '';
		if (cur_page > 3) {
			first_page += '<li  data-page="1" class="page-item" ><a class="page-link">1</a></li>';
		}
		if (cur_page >= 5) {
			first_page += '<li> <a style="padding: 12px 5px 0; pointer-events: none;user-select: none; display:block;">...</a> <li>';
		}

		let last_page = '';
		if (cur_page <= (total_page - 4)) {
			last_page += '<li> <a style="padding: 12px 5px 0px; pointer-events: none;user-select: none; display:block;">...</a> <li>';
		}
		if (cur_page < (total_page - 2)) {
			last_page += '<li class="page-item" ><a data-page="' + total_page + '" class="page-link">' + total_page + '</a></li>';
		}

		let previous_page = '';
		if (cur_page > 1) {
			previous_page = '<li class="page-item" ><a data-page="' + (cur_page - 1) + '" class="page-link"><i class="fa fa-angle-left"></i></a></li>';
		}

		let next_page = '';
		if (cur_page < total_page) {
			next_page = '<li class="page-item" ><a data-page="' + (cur_page + 1) + '" class="page-link"><i class="fa fa-angle-right"></i></a></li>';
		}

		let page = new Array();
		for (let x = current_range[0]; x <= current_range[1]; ++x) {
			let active = '';
			if (x == cur_page) {
				active = "pageactive";
			}
			let html = '<li class="page-item"><a data-page="' + x + '" class="page-link ' + active + '">' + x + '</a></li>';
			page.push(html);
		}
		if (total_page > 1) {
			return previous_page + first_page + page.join(" ") + last_page + next_page;
		} else return '';
	}

	const handleDetailNews = function (id_news, callBack) {
		fetch(urlAPI_DetailNews + id_news, {
			method: 'GET',
		})
			.then((response) => response.json())
			.then((data) => {
				if (data !== null) {
					if (callBack) {
						callBack(data)
					}
				} else {
					location.reload();
				}
			})
			.catch((error) => {
				location.reload();
			});
	}

	const createState = function (data) {
		return {
			id: data.id,
			title: data.title,
			content: data.content,
			image: data.img,
			createAT: moment(data.dt).format('DD/MM/YYYY'),
		};
	}

	const displayContent = function (state, sidebar) {
		// Push title
		document.title = state.title;
		document.querySelector("meta[name='description']").setAttribute("content", state.content);
		document.querySelector("meta[property='og:description']").setAttribute("content", state.content);
		document.querySelector("meta[property='og:title']").setAttribute("content", state.title);
		document.querySelector("meta[property='og:image']").setAttribute("content", 'https://vinavote.com/' + state.image);

		return `<div class="chart-detail_news">
									<div class="chart-breadcrumb py-3">
										<div class="container-fluid">
											<nav style="--bs-breadcrumb-divider: url(&#34;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='%236c757d'/%3E%3C/svg%3E&#34;);"
											     aria-label="breadcrumb">
												<ol class="breadcrumb mb-0">
													<li class="breadcrumb-item"><a href="https://vinavote.com"><i class="fas fa-home-alt"></i>&nbsp;Trang chủ</a></li>
													<li class="breadcrumb-item active" id="breadcrumb-fill">${state.title}</li>
												</ol>
											</nav>
											<div class="detail-news_wrapper">
												<div class="row g-3">
													<div class="col-lg-9">
														<div class="rounded-1 p-lg-4 p-2 detail-news_content">
															<h1 class="detail-news_title">
																${state.title}
															</h1>
															<div class="row align-items-center flex-column flex-md-row">
																<div class="col-auto flex-shrink-0 mb-1 mb-md-0">
																	<div class="detail-news_metas">
																		<div class="meta-list">
																			<div class="meta-item">
																				<i class="fas fa-calendar-alt"></i>
																				Ngày đăng
																				<span>${state.createAT}</span>
																			</div>
																		</div>
																	</div>
																</div>
																<div class="col-auto flex-grow-1 d-flex justify-content-md-end">
																	<div class="detail-news_social">
																		<ul class="list-unstyled mb-0">
																			<li class="share">
																				Chia sẻ:
																			</li>
																			<li>
																				<div class="fb-share-button"
																				     data-href="https://vinavote.com/detail.html?post=${state.id}"
																				     data-layout="button" data-size="small">
																					<a target="_blank"
																					   href="https://vinavote.com/detail.html?post=${state.id}"
																					   class="fb-xfbml-parse-ignore">Chia sẻ</a>
																				</div>
																			</li>
																			<li>
																				<div class="zalo-share-button"
																				     data-href="https://vinavote.com/detail.html?post=${state.id}"
																				     data-oaid="579745863508352884" data-layout="1"
																				     data-color="blue" data-customize="false"
																				     style="position: relative; display: inline-block; width: 70px; height: 20px;">
																					<iframe id="69b9793d-9f38-4285-903b-85e1b9bf664e"
																					        name="69b9793d-9f38-4285-903b-85e1b9bf664e"
																					        frameborder="0" allowfullscreen="" scrolling="no"
																					        width="70px" height="20px"
																					        src="https://button-share.zalo.me/share_inline?id=69b9793d-9f38-4285-903b-85e1b9bf664e&amp;layout=1&amp;color=blue&amp;customize=false&amp;width=70&amp;height=20&amp;isDesktop=true&amp;url=https%3A%2F%2Fjaybee-k.github.io%2Ftemplate-baobi&amp;d=eyJ1cmwiOiJodHRwczovL2pheWJlZS1rLmdpdGh1Yi5pby90ZW1wbGF0ZS1iYW9iaSJ9&amp;shareType=0"
																					        style="position: absolute; z-index: 99; top: 0px; left: 0px;"></iframe>
																				</div>
																			</li>
																		</ul>
																	</div>
																</div>
															</div>
															<div class="pt-3 mt-3 detail-news_description" id="detail-news_description">
																<div class="mb-3 mt-2 text-center">
																	<img src="https://vinavote.com/${state.image}" class="img-fluid mw-100" alt="${state.title}">
																</div>
																${state.content.replace(/\n/g, "<br>")}
															</div>
															<div id="fb-root"></div>
															<script async defer crossorigin="anonymous" src="https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v15.0"
																	nonce="yTOmTKsy"></script>
															<script src="https://sp.zalo.me/plugins/sdk.js"></script>
														</div>
														<div class="chart-profile_news">
															<div class="chart-profile_left">
																<div class="chart-profile_avatar ratio ratio-1x1">
																	<img src="https://vinavote.com/hung.jpg"
																	     class="img-fluid"
																	     alt="">
																</div>
																<div class="chart-profile_title">
																	Tác giả: NGUYỄN HUY HƯNG
																</div>
																<div class="chart-profile_button">
																	<a href="./profile.html">
																		Xem thêm
																	</a>
																</div>
															</div>
															<div class="chart-profile_right">
																<div class="chart-profile_subtitle">
																	Thông tin thêm về tác giả
																</div>
																<div class="chart-profile_text">
																	Sollicitudin ac orci phasellus egestas tellus rutrum. Venenatis cras sed felis eget. Amet risus
																	nullam eget felis eget nunc. Lacus vestibulum sed arcu non odio euismod. Consectetur adipiscing
																	elit duis tristique.Pharetra magna ac placerat vestibulum lectus mauris ultrices.
																</div>
																<div class="chart-profile_list">
																	<div class="row g-2">
																		<div class="col-md-6">
																			1. Trưởng Ban kiểm soát, Tập đoàn Hòa Bình (mã HBC)
																		</div>
																		<div class="col-md-6">
																			2. Trưởng Ban Tài chính, Tập đoàn Tây Bắc
																		</div>
																		<div class="col-md-6">
																			1. Trưởng Ban kiểm soát, Tập đoàn Hòa Bình (mã HBC)
																		</div>
																		<div class="col-md-6">
																			2. Trưởng Ban Tài chính, Tập đoàn Tây Bắc
																		</div>
																		<div class="col-md-6">
																			1. Trưởng Ban kiểm soát, Tập đoàn Hòa Bình (mã HBC)
																		</div>
																		<div class="col-md-6">
																			2. Trưởng Ban Tài chính, Tập đoàn Tây Bắc
																		</div>
																		<div class="col-md-6">
																			1. Trưởng Ban kiểm soát, Tập đoàn Hòa Bình (mã HBC)
																		</div>
																		<div class="col-md-6">
																			2. Trưởng Ban Tài chính, Tập đoàn Tây Bắc
																		</div>
																		<div class="col-md-6">
																			1. Trưởng Ban kiểm soát, Tập đoàn Hòa Bình (mã HBC)
																		</div>
																		<div class="col-md-6">
																			2. Trưởng Ban Tài chính, Tập đoàn Tây Bắc
																		</div>
																		<div class="col-md-6">
																			1. Trưởng Ban kiểm soát, Tập đoàn Hòa Bình (mã HBC)
																		</div>
																		<div class="col-md-6">
																			2. Trưởng Ban Tài chính, Tập đoàn Tây Bắc
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</div>
													<div class="col-lg-3">
														<div class="rounded-1 p-lg-4 p-2 detail-news_sidebar">
															<div class="section-heading mb-0">
																<div class="section-heading_title">
																	Kiến thức chứng khoán mới
																</div>
															</div>
															<div class="detail-news_list" id="detail-news_list"></div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>`
	}

	const handleSidebarNews = function (id) {
		fetch(urlAPI_ListNews, {
			method: 'POST',
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.length) {
					let renderTemplateSidebarNews = '';
					data = data.filter(elm => elm.id !== id);
					data = data.sort(function (a, b) {
						return (a.dt < b.dt) - (a.dt > b.dt)
					});

					data.map(function (data, index) {
						if (index < 5) {
							renderTemplateSidebarNews += `<div class="detail-news_list__item">
															<a href="./detail.html?post=${data.id}">
																<div class="article-list_item--title">
																	${data.title}
																</div>
																<div class="article-list_item--date">
																	<i class="fas fa-calendar-alt"></i>
																	<span>${moment(data.dt).format('DD/MM/YYYY')}</span>
																</div>
															</a>
														</div>`;

						}
					});
					$('#detail-news_list').html(renderTemplateSidebarNews);
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	const handleSubscribe = function () {
		if ($('#subscribe-form').length > 0) {
			$('#subscribe-form').submit(function (event) {
				event.preventDefault();
				event.stopPropagation();

				let subscribeFrm = $(this), subscribeButton = subscribeFrm.find('#subscribe-button'),
					subscribeError = $('#subscribe-error');

				subscribeButton.html(`Vui lòng chờ <i class="fal fa-spinner fa-spin ms-2"></i>`);
				subscribeButton.prop('disabled', true);

				if (!subscribeFrm[0].checkValidity()) {
					event.preventDefault();
					event.stopPropagation();
					subscribeFrm.addClass('was-validated');
					subscribeFrm.find('[name][required]:invalid').first().focus();
					subscribeButton.prop('disabled', false);
				} else {
					const urlEncoded = new URLSearchParams({
						"mail": subscribeFrm.find('#mail').val(),
					});

					fetch(urlAPI_Subscribe, {
						method: 'POST', body: urlEncoded,
					})
						.then((response) => response.json())
						.then((result) => {
							const status = result.status;
							switch (status) {
								case 200:
									subscribeButton.html('Ok');
									subscribeButton.attr({
										'type': 'button', 'data-bs-dismiss': 'modal', 'disabled': false, 'id': '',
									})
									subscribeError.html('');
									subscribeError.removeClass('is-error');
									break;
								case 501:
									subscribeError.html('Thất bại. Email đã đăng ký nhận tin trước đây');
									subscribeError.addClass('is-error');
									subscribeButton.html('Ok');
									subscribeButton.attr({
										'type': 'button', 'data-bs-dismiss': 'modal', 'disabled': false, 'id': '',
									})
									subscribeButton.prop('disabled', false);
									break;
								default:
									subscribeError.html('Có lỗi trong quá trình gửi, vui lòng thử lại');
									subscribeError.addClass('is-error');
									subscribeButton.html('Gửi liên hệ');
									subscribeButton.prop('disabled', false);
									break;
							}
						})
						.catch((error) => {
							subscribeButton.html('Gửi liên hệ');
							subscribeButton.prop('disabled', false);
						});
				}
				return false;
			})
		}
	}

	const handleInitSlick = function (chartFloatingContent) {
		chartFloatingContent.slick({
			slidesToShow: 3,
			slidesToScroll: 1,
			speed: 2000,
			cssEase: 'linear',
			draggable: false,
			swipe: false,
			touchMove: false,
			autoplay: true,
			autoplaySpeed: 0,
			useTransform: true,
			vertical: true,
			verticalSwiping: true,
			adaptiveHeight: true,
			infinite: true,
			pauseOnHover: false,
			pauseOnFocus: false,
			swipeToSlide: true,
		});
	}

	$(function () {
		if (typeof page === 'undefined') {
			handleFetchInfo(function () {
				clearInterval(intervalInfo);
				intervalInfo = setInterval(function () {
					handleFetchInfo();
				}, timeFetchPrice);
			});

			handleFetchDJIndex(function () {
				clearInterval(intervalDJIndex);
				intervalDJIndex = setInterval(function () {
					handleFetchDJIndex();
				}, timeFetchPrice);
			});

			handleFetchData(function () {
				handleSortData();
				handleFilterData();
				handleSearch();
				handleChartModal();

				clearInterval(intervalPrice);
				intervalPrice = setInterval(function () {
					handleFetchPrice();
				}, timeFetchPrice);
			});

			handleFetchTopTangGia();
			handleFetchKhoiNgoai();

			handleCallTab();

			handleSetPadding();
			handleSetPaddingNews();
			handleSetHeightColumn();

			handleFetchNews(function (chartFloatingContent) {
				handleToggleNews(chartFloatingContent);
				handleVisiableNews(chartFloatingContent);

				clearInterval(intervalFetchNews);
				intervalFetchNews = setInterval(function () {
					handleFetchNews();
				}, timeFetchNews);
			});
			$(window).resize(function () {
				windowWidth = $(window).width();
				handleSetMinWidth();
				handleSetColWidth();
				handleSetPadding();
				handleSetPaddingNews();
				handleSetHeightColumn();
			});

			const randomIntFromInterval = function (min, max) {
				return Math.floor(Math.random() * (max - min + 1) + min)
			}
			const rndInt = randomIntFromInterval(1, 3)
			if (rndInt === 1) {
				$('#subscribe-modal').modal('show');
				handleSubscribe();
			}
			handleFetchListNews();

			let origValue = document.getElementById("translationDetector").innerHTML;

			document.getElementById("translationDetector").addEventListener("DOMSubtreeModified", translationCallback, false);

			function translationCallback() {
				let currentValue = document.getElementById("translationDetector").innerHTML;
				if (currentValue && currentValue.indexOf(origValue) < 0) {
					origValue = currentValue;
					$('.chart-table').each(function () {
						if ($(this).find('.chart-table_header').length) {
							$(this).find('.chart-table_header').each(function () {
								let row = $(this), rowHeight = row.outerHeight(),
									headerHeight = $('#header').outerHeight(),
									actionHeight = $('#chart-action').outerHeight(),
									textHeight = $('#chart-text').outerHeight();
								if (windowWidth >= 1280) {
									row.parents('.chart-body').css('padding-top', rowHeight - 2);
								} else if (windowWidth >= 992 && windowWidth < 1280) {
									row.parents('.chart-body').css('padding-top', actionHeight);
								} else {
									row.parents('.chart-body').css('padding-top', actionHeight + textHeight + 10);
									$('#chart-action').css('top', headerHeight + 5);
									$('#chart-text').css('top', headerHeight + actionHeight + 5);
								}
							})
						}
					});
				}
			}

		} else if (page === 'detail_post') {
			let state;
			handleDetailNews(id_news, function (data) {
				state = createState(data);
				handleSidebarNews(state.id);
				$('#chart-main').html(displayContent(state));
			});
		}

		if (typeof page !== 'undefined') {
			$('#header, #chart-action, #chart-text').addClass('position-static pt-1');
			$('#chart-main').addClass('py-0');
			$('#chart-news').addClass('py-2');
		}
	});
})
(jQuery);
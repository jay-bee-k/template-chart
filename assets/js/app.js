;(function ($) {
	'use strict';
	const urlAPI_Data = 'https://wipomart.com/main.php';
	const urlAPI_Price = 'https://wipomart.com/getprice.php';
	let fetchFirst = false;

	let formatPercent = function (value, fixed = 2) {
		return parseFloat(value).toFixed(fixed).replace(/\d(?=(\d{3})+\.)/g, '$&,');
	}

	let formatPrice = function (value) {
		value = value.replace(/[^0-9]/g, '');
		value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return value;
	}

	let formatClass = function (value) {
		console.log(value);
		if (value !== null) {
			if (value > 0) {
				return 'chart-text_success';
			} else {
				return 'chart-text_danger';
			}
		}
	}

	let renderTemplate = function (data) {
		return `<div class="chart-table_row chart-table_border__row" data-row="${data.stock_code}">
					<div class="chart-table_col chart-table_border__col chart-table_col__1 text-start justify-content-start">
						<span class="chart-table_text chart-text_success">
							${data.stock_code} <a href="" class="chart-table_btn">View More</a>
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__2 text-end justify-content-end">
						<span class="chart-table_text chart-text_success" data-price> 
							${data.stock_price}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__3 text-end justify-content-end chart-table_highlight">
						<span class="chart-table_text chart-text_success" data-percent>
							${data.changePercent}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__4 text-end justify-content-end chart-table_highlight">
						<span class="chart-table_text chart-text_success">
							${data.pe}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__5 text-end justify-content-end chart-table_highlight__2">
						<span class="chart-table_text chart-text_success">
							${data.eps}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__6 text-end justify-content-end">
						<span class="chart-table_text chart-text_success">
							${formatPercent(data.yearRevenueGrowth)}%
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__7 text-end justify-content-end">
						<span class="chart-table_text chart-text_success">
							${formatPercent(data.quarterRevenueGrowth)}%
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__8 text-end justify-content-end">
						<span class="chart-table_text chart-text_success">
							${data.deposit !== null ? formatPrice(data.deposit) : ''}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__9 text-end justify-content-end">
						<span class="chart-table_text chart-text_success">
							${formatPrice(data.revenue)}
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__10 text-end justify-content-end">
						<span class="chart-table_text chart-text_success">
							${formatPercent(data.priceChange1y)}%
						</span>
					</div>
					<div class="chart-table_col chart-table_border__col chart-table_col__11 text-end justify-content-end">
						<span class="chart-table_text chart-text_success">
							${formatPercent(data.priceChange3m)}%
						</span>
					</div>
					<div class="chart-table_body__group">
						<div class="chart-table_col chart-table_border__col chart-table_col__same text-end">
							<span class="chart-table_text chart-text_success">
								${data.stock_high_next_day1 !== null ? data.stock_high_next_day1 : ''}
							</span>
						</div>
						<div class="chart-table_col chart-table_border__col chart-table_col__same text-end">
							<span class="chart-table_text chart-text_success">
								${data.stock_low_next_day1 !== null ? data.stock_low_next_day1 : ''}
							</span>
						</div>
						<div class="chart-table_col chart-table_border__col chart-table_col__same text-end chart-table_highlight">
							<span class="chart-table_text chart-text_success">
								${data.stock_close_next_day1 !== null ? data.stock_close_next_day1 : ''}
							</span>
						</div>
						<div class="chart-table_col chart-table_border__col chart-table_col__same text-end">
							<span class="chart-table_text chart-text_success">
								${data.stock_high_next_day2 !== null ? data.stock_high_next_day2 : ''}
							</span>
						</div>
						<div class="chart-table_col chart-table_border__col chart-table_col__same text-end">
							<span class="chart-table_text chart-text_success">
								${data.stock_low_next_day2 !== null ? data.stock_low_next_day2 : ''}
							</span>
						</div>
						<div class="chart-table_col chart-table_border__col chart-table_col__same text-end chart-table_highlight">
							<span class="chart-table_text chart-text_success">
								${data.stock_close_next_day2 !== null ? data.stock_close_next_day2 : ''}
							</span>
						</div>
						<div class="chart-table_col__group___last d-flex">
							<div class="chart-table_col chart-table_border__col chart-table_col__99 text-end chart-table_highlight">
								<span class="chart-table_text chart-text_success">
									${formatPercent(data.agv10)}
								</span>
							</div>
							<div class="chart-table_col chart-table_border__col chart-table_col__100 text-end chart-table_highlight">
								<span class="chart-table_text chart-text_success">
									1.0%
								</span>
							</div>
						</div>
					</div>
				</div>`;
	}

	let handleFetchData = function () {
		$.post(urlAPI_Data, function (res) {
			if (res.length) {
				let renderTemplateList = '';
				res.map(function (data) {
					renderTemplateList += renderTemplate(data);
				});

				$('#chart-list').append(renderTemplateList);

				fetchFirst = true;
				handleFetchPrice();
			}
		}, 'JSON').fail(function (xhr) {
			setInterval(function () {
				handleFetchData();
			}, 5000);
		});
	}

	let handleFetchPrice = function () {
		if (fetchFirst) {
			setInterval(function () {
				$.post(urlAPI_Price, function (res) {
					if (res.length) {
						res.map(function (data) {
							let rowChange = $('.chart-table_row[data-row="' + data.stock_code + '"]');
							if(rowChange.length) {
								console.log(rowChange.find('data-price'));
								rowChange.find('.chart-table_text[data-price]').html(data.stock_price);
								rowChange.find('.chart-table_text[data-percent]').html(data.changePercent);
							}
						});
					}
				}, 'JSON').fail(function (xhr) {
					setTimeout(function () {
						handleFetchPrice();
					}, 30000);
				})
			}, 30000);
		}
	}

	let windowWidth = $(window).width();

	let handleSearch = function () {
		if ($('#chartSearch').length) {
			let chartSearch = $('#chartSearch'), chartSearch_wrap = chartSearch.closest('.chart-search');
			chartSearch.keyup(function () {
				let chartSearch_elm = $(this), chartSearch_value = $.trim(chartSearch_elm.val());

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
		if (windowWidth >= 1280 && $('.chart-table_header').length) {
			let row = $('.chart-table_header'), rowHeight = row.outerHeight();

			row.parents('.chart-body').css('padding-top', 37 + rowHeight);
		}
	}

	$(function () {
		handleFetchData();
		handleSearch();
		handleSort();
		handleSetMinWidth();
		handleSetPadding();

		$(window).resize(function () {
			windowWidth = $(window).width();
			handleSetMinWidth();
			handleSetPadding();
		});
	});
})(jQuery);
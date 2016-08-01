'use strict';
let {formatTags, countBarcodes, buildCartItems, buildPromotions, calculateTotalPrices, buildReceipt, printReceipt} = require('../main/main');
let {loadAllItems, loadPromotions} = require('./fixtures');

describe('pos', () => {

  it('#1| format the tags', ()=> {
    const tags = [
      'ITEM000001',
      'ITEM000001',
      'ITEM000003-2.5',
      'ITEM000005',
      'ITEM000005-2',
    ];

    const formattedTags = formatTags(tags);
    const expected = [
      {barcode: 'ITEM000001', count: 1},
      {barcode: 'ITEM000001', count: 1},
      {barcode: 'ITEM000003', count: 2.5},
      {barcode: 'ITEM000005', count: 1},
      {barcode: 'ITEM000005', count: 2}
    ];

    expect(formattedTags).toEqual(expected);
  });

  it('#2| count the tags', ()=> {
    const formattedTags = [
      {barcode: 'ITEM000001', count: 1},
      {barcode: 'ITEM000001', count: 1},
      {barcode: 'ITEM000003', count: 2.5},
      {barcode: 'ITEM000001', count: 1}
    ];
    let countedBarcodes = countBarcodes(formattedTags);
    let expected = [
      {barcode: 'ITEM000001', count: 3},
      {barcode: 'ITEM000003', count: 2.5}
    ];

    expect(countedBarcodes).toEqual(expected);
  });

  it('#3| build cart items', ()=> {
    const countedBarcodes = [
      {barcode: 'ITEM000001', count: 3},
      {barcode: 'ITEM000003', count: 2.5}
    ];

    const allItems = loadAllItems();
    const cartItems = buildCartItems(countedBarcodes, allItems);

    const expected = [
      {barcode: 'ITEM000001', name: '雪碧', unit: '瓶', price: 3.00, count: 3},
      {barcode: 'ITEM000003', name: '荔枝', unit: '斤', price: 15.00, count: 2.5}
    ];

    expect(cartItems).toEqual(expected);
  });

  it('#4| build promoted items', ()=> {
    const cartItems = [
      {barcode: 'ITEM000000', name: '可口可乐', unit: '瓶', price: 3.00, count: 3},
      {barcode: 'ITEM000002', name: '苹果', unit: '斤', price: 5.50, count: 2.5},
      {barcode: 'ITEM000005', name: '方便面', unit: '袋', price: 4.50, count: 2}
    ];

    const promotions = loadPromotions();
    const promotedItems = buildPromotions(cartItems, promotions);
    const expected = [
      {
        barcode: 'ITEM000000', name: '可口可乐', unit: '瓶', price: 3.00, count: 3,
        payPrice: 6, saved: 3
      },
      {
        barcode: 'ITEM000002', name: '苹果', unit: '斤', price: 5.50, count: 2.5,
        payPrice: 13.75, saved: 0
      },
      {
        barcode: 'ITEM000005', name: '方便面', unit: '袋', price: 4.50, count: 2,
        payPrice: 9, saved: 0
      }
    ];

    expect(promotedItems).toEqual(expected);
  });

  it('#5| calculate total prices', ()=> {
    const promotedItems = [
      {
        barcode: 'ITEM000000',
        name: '可口可乐',
        unit: '瓶',
        price: 3.00,
        count: 3,
        payPrice: 6,
        saved: 3
      },
      {
        barcode: 'ITEM000002',
        name: '苹果',
        unit: '斤',
        price: 5.50,
        count: 2.5,
        payPrice: 13.75,
        saved: 0
      },
      {
        barcode: 'ITEM000005',
        name: '方便面',
        unit: '袋',
        price: 4.50,
        count: 2,
        payPrice: 9,
        saved: 0
      }
    ];

    const totalPrices = calculateTotalPrices(promotedItems);
    const expected = {
      totalPayPrice: 28.75,
      totalSaved: 3
    };

    expect(totalPrices).toEqual(expected);

  });

  it('#6| build receipt', ()=> {
    const promotedItems = [
      {
        barcode: 'ITEM000000',
        name: '可口可乐',
        unit: '瓶',
        price: 3.00,
        count: 3,
        payPrice: 6,
        saved: 3
      },
      {
        barcode: 'ITEM000002',
        name: '苹果',
        unit: '斤',
        price: 5.50,
        count: 2.5,
        payPrice: 13.75,
        saved: 0
      },
      {
        barcode: 'ITEM000005',
        name: '方便面',
        unit: '袋',
        price: 4.50,
        count: 2,
        payPrice: 9,
        saved: 0
      }
    ];

    const totalPrices = {
      totalPayPrice: 28.75,
      totalSaved: 3
    };

    const receipt = buildReceipt(promotedItems, totalPrices);

    const expected = {
      receiptItems: [
        {
          name: '可口可乐',
          unit: '瓶',
          price: 3.00,
          count: 3,
          payPrice: 6,
          saved: 3
        },
        {
          name: '苹果',
          unit: '斤',
          price: 5.50,
          count: 2.5,
          payPrice: 13.75,
          saved: 0
        },
        {
          name: '方便面',
          unit: '袋',
          price: 4.50,
          count: 2,
          payPrice: 9,
          saved: 0
        }
      ],

      totalPayPrice: 28.75,
      totalSaved: 3
    };

    expect(receipt).toEqual(expected);
  });

  it('should print text', () => {

    const tags = [
      'ITEM000001',
      'ITEM000001',
      'ITEM000001',
      'ITEM000001',
      'ITEM000001',
      'ITEM000003-2.5',
      'ITEM000005',
      'ITEM000005-2',
    ];

    spyOn(console, 'log');

    printReceipt(tags);

    const expectText = `***<没钱赚商店>收据***
名称：雪碧，数量：5瓶，单价：3.00(元)，小计：12.00(元)
名称：荔枝，数量：2.5斤，单价：15.00(元)，小计：37.50(元)
名称：方便面，数量：3袋，单价：4.50(元)，小计：9.00(元)
----------------------
总计：58.50(元)
节省：7.50(元)
**********************`;
    require('fs').writeFileSync('2.txt',expectText);


    expect(console.log).toHaveBeenCalledWith(expectText);
  });
});

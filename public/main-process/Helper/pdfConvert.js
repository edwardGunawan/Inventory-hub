const pdfKit = require('pdfkit')
const moment = require('moment')
const numeral = require('numeral')
const i18n = require('./i18n')

const TEXT_SIZE = 10
const CONTENT_LEFT_PADDING = 25

function PDFInvoice({
  company, // {phone, email, address}
  customer, // {name, email}
  receiptNum, // timestamps
  items, // [{total, code,brand, quantity price}]
  discount, // discount
  action, // sell or return invoice
  rekening// rekening
}){
  const date = new Date()
  const charge = {
    createdAt: `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}`,
    total: items.reduce((acc, item) => acc + item.price*item.quantity, 0),
  }
  charge.total = charge.total*(1-discount/100);
  const doc = new pdfKit({size: 'A4', margin: 50});

  doc.fillColor('#333333');

  const translate = i18n[PDFInvoice.lang]
  moment.locale(PDFInvoice.lang)

  const divMaxWidth = 550;
  const table = {
    x: CONTENT_LEFT_PADDING,
    y: 200,
    inc: 110,
  };

  return {
    genHeader(){
      doc
       .fontSize(20)
       .text(company.name, CONTENT_LEFT_PADDING, 50);
      doc.fontSize(13).text(company.address);
      doc.fontSize(13).text(company.phone);
      doc.text(`No. ${receiptNum}`)

      const borderOffset = doc.currentLineHeight() + 110;

      doc
        .fontSize(16)
        .fillColor('#cccccc')
        .text(moment().format('MMMM, DD, YYYY'), CONTENT_LEFT_PADDING, 50, {
          align: 'right',
        })
        .fillColor('#333333');

      doc
        .strokeColor('#cccccc')
        .moveTo(CONTENT_LEFT_PADDING, borderOffset)
        .lineTo(divMaxWidth, borderOffset);
    },

    genFooter(){
      doc.fillColor('#424242');

      doc
        .fontSize(12)
        .text('Pembayaran via transfer ke rekening', CONTENT_LEFT_PADDING, 450);

      doc
        .fontSize(12)
        .text('BCA a/n')

      doc
        .font('Helvetica-Bold')
        .text(rekening.number)

      doc
        .font('Helvetica')
        .fontSize(12)
        .text('a/n')

      doc
        .font('Helvetica-Bold')
        .text(rekening.name)

      // doc.text(company.address);
      // doc.text(company.phone);
      // doc.text(company.email);

      doc.fillColor('#333333');
    },

    genCustomerInfos(){
      doc
        .fontSize(TEXT_SIZE)
        .text(translate.chargeFor, CONTENT_LEFT_PADDING, 400);

      doc
        .fontSize(14)
        .text(`${customer.name}`);

      doc
       .fontSize(14)
       .text(action)
    },

    genTableHeaders(){
      [
        'code',
        'brand',
        'quantity',
        'price',
        'total'
      ].forEach((text, i) => {
        doc
          .fontSize(TEXT_SIZE)
          .text(translate[text], table.x + i * table.inc, table.y);
      });
    },

    genTableRow(){
      items
        .map(item => Object.assign({}, item, {
          price: numeral(item.price).format('$ 0,00.00'),
          total: numeral(item.total).format('$ 0,00.00')
        }))
        .forEach((item, itemIndex) => {
          [
            'code',
            'brand',
            'quantity',
            'price',
            'total'
          ].forEach((field, i) => {
            doc
              .fontSize(TEXT_SIZE)
              .text(item[field], table.x + i * table.inc, table.y + TEXT_SIZE + 6 + itemIndex * 20);
          });
        })
        // console.log(items.length);
        doc.fontSize(TEXT_SIZE)
           .text(`Discount: ${discount}%`, table.x + 3 * table.inc, table.y + TEXT_SIZE + 6 + (items.length) * 20);
        doc.fontSize(TEXT_SIZE)
           .text(`$ ${charge.total}`,table.x + 4 * table.inc,table.y + TEXT_SIZE + 6 + (items.length) * 20);

    },

    genTableLines(){
      const offset = doc.currentLineHeight() + 2;
      doc
        .moveTo(table.x, table.y + offset)
        .lineTo(divMaxWidth, table.y + offset)
        .stroke();
    },

    generate(){
      this.genHeader();
      this.genTableHeaders();
      this.genTableLines();
      this.genTableRow();
      this.genCustomerInfos();
      this.genFooter();

      doc.end();
    },

    get pdfkitDoc(){
      return doc
    },
  };
}

PDFInvoice.lang = 'en_US'

module.exports = PDFInvoice

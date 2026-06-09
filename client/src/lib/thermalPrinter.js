const STORE_NAME = 'PETERNTAKAN MAKMUR'
const STORE_ADDRESS = 'Jl. Pertanian No. 12, Subang'
const LINE_WIDTH = 32

function padRight(text, width) {
  const str = String(text)
  return str.length >= width ? str : str + ' '.repeat(width - str.length)
}

function padLeft(text, width) {
  const str = String(text)
  return str.length >= width ? str : ' '.repeat(width - str.length) + str
}

function centerText(text, width) {
  const str = String(text)
  const pad = Math.max(0, Math.floor((width - str.length) / 2))
  return ' '.repeat(pad) + str
}

function repeat(char, count) {
  return Array(count + 1).join(char)
}

function formatCurrency(value) {
  return (value || 0).toLocaleString('id-ID')
}

export function buildReceiptText(sale) {
  const lines = []
  const line = (t) => lines.push(t)
  const sep = () => line(repeat('=', LINE_WIDTH))
  const dash = () => line(repeat('-', LINE_WIDTH))

  sep()
  line(centerText(STORE_NAME, LINE_WIDTH))
  line(centerText(STORE_ADDRESS, LINE_WIDTH))
  sep()

  const saleDate = new Date(sale.created_at)
  line('Tanggal  : ' + saleDate.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + saleDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }))
  line('Transaksi: #' + sale.id)

  dash()

  for (const item of sale.items) {
    const name = item.item_name.length > 14
      ? item.item_name.substring(0, 13) + '.'
      : item.item_name

    const qtyPrice = item.quantity + ' x ' + formatCurrency(item.unit_price)
    const subtotal = formatCurrency(item.subtotal)

    line(padRight(name, 14) + padLeft(qtyPrice, 10) + padLeft(subtotal, 8))
  }

  dash()

  line(padRight('TOTAL', 14) + padLeft('Rp ' + formatCurrency(sale.total_amount), 18))
  line(padRight('PROFIT', 14) + padLeft('Rp ' + formatCurrency(sale.total_profit), 18))

  sep()
  line(centerText('Terima kasih telah', LINE_WIDTH))
  line(centerText('berbelanja!', LINE_WIDTH))
  sep()

  line('')
  line('')
  line('')

  return lines.join('\n')
}

export async function printViaBluetooth(sale) {
  if (!navigator.bluetooth) {
    throw new Error('BLUETOOTH_NOT_SUPPORTED')
  }

  const available = await navigator.bluetooth.getAvailability()
  if (!available) {
    throw new Error('BLUETOOTH_NOT_AVAILABLE')
  }

  console.log('[BT] Requesting device...')
  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: [0x1101]
  })
  console.log('[BT] Device selected:', device.name, device.id)

  console.log('[BT] Connecting GATT...')
  const server = await device.gatt.connect()
  console.log('[BT] GATT connected')

  const SPP_SERVICE = '00001101-0000-1000-8000-00805f9b34fb'

  console.log('[BT] Getting primary service...')
  const service = await server.getPrimaryService(SPP_SERVICE)
  console.log('[BT] Service obtained')

  console.log('[BT] Listing characteristics...')
  const chars = await service.getCharacteristics()
  let writeChar = null
  for (const c of chars) {
    console.log('[BT]   char:', c.uuid, 'props:', JSON.stringify(c.properties))
    if (c.properties.write || c.properties.writeWithoutResponse) {
      writeChar = c
    }
  }

  if (!writeChar) {
    throw new Error('No writable characteristic found on printer')
  }

  const useWriteWithoutResponse = writeChar.properties.writeWithoutResponse
  console.log('[BT] Write method:', useWriteWithoutResponse ? 'writeWithoutResponse' : 'writeValue')

  const escInit = new Uint8Array([0x1B, 0x40])
  const escFeedCut = new Uint8Array([0x1D, 0x56, 66, 3])

  const text = buildReceiptText(sale).replace(/\n/g, '\r\n')
  const encoder = new TextEncoder()
  const textData = encoder.encode(text)

  const data = new Uint8Array(escInit.length + textData.length + escFeedCut.length)
  data.set(escInit, 0)
  data.set(textData, escInit.length)
  data.set(escFeedCut, escInit.length + textData.length)

  console.log('[BT] Writing', data.length, 'bytes...')
  const mtu = 512
  for (let i = 0; i < data.length; i += mtu) {
    const chunk = data.slice(i, Math.min(i + mtu, data.length))
    if (useWriteWithoutResponse) {
      await writeChar.writeValueWithoutResponse(chunk)
    } else {
      await writeChar.writeValue(chunk)
    }
  }
  console.log('[BT] Write complete')

  device.gatt.disconnect()
  console.log('[BT] Disconnected')
  return true
}

export function printViaBrowser(sale) {
  const text = buildReceiptText(sale)

  const existing = document.getElementById('print-iframe')
  if (existing) existing.remove()

  const iframe = document.createElement('iframe')
  iframe.id = 'print-iframe'
  iframe.style.display = 'none'
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Struk #${sale.id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.3; padding: 8px; }
          pre { white-space: pre; }
        </style>
      </head>
      <body>
        <pre>\n${text}\n</pre>
      </body>
    </html>
  `)
  doc.close()

  iframe.onload = () => {
    iframe.contentWindow.focus()
    iframe.contentWindow.print()
  }
}

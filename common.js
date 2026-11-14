const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

function get(x) {
    return document.getElementById(x)
}

function saveData(d) {
    try {
        sessionStorage.setItem("torimatrix", JSON.stringify(d))
    } catch (e) {}
}

function loadData() {
    try {
        const s = sessionStorage.getItem("torimatrix")
        return s ? JSON.parse(s) : null
    } catch (e) {
        return null
    }
}

function genNavbar(content) {
    let navbar = get("navbar")
    navbar.innerHTML = ""

    content.forEach(e => {
        let btn = document.createElement("input")
        btn.type = "button"
        btn.className = "basic-btn"
        btn.value = e.text
        btn.onclick = e.onclick
        navbar.appendChild(btn)
    })
}

function pickFile(cb) {
    let inp = document.createElement("input")
    inp.type = "file"
    inp.accept = ".json"
    inp.onchange = async () => {
        if (!inp.files[0]) return
        try {
            cb(normalize(JSON.parse(await inp.files[0].text())))
        } catch (e) {
            get("cont-2").innerHTML = "<h2>bad json</h2><p>" + e.message + "</p>"
        }
    }
    inp.click()
}

function parseDate(s) {
    const m = String(s).trim().match(/^(-?\d+)(?:-(\d{1,2}))?(?:-(\d{1,2}))?$/)
    return m ? [Number(m[1]), Number(m[2] || 0), Number(m[3] || 0)] : null
}

function formatDate(s) {
    const p = parseDate(s)
    if (!p) return String(s)
    let out = String(p[0])
    if (p[1]) out += ". " + (MONTHS[p[1] - 1] ?? p[1])
    if (p[2]) out += " " + p[2] + "."
    return out
}

function dateCmp(a, b) {
    const x = parseDate(a) || [1e9, 0, 0]
    const y = parseDate(b) || [1e9, 0, 0]
    return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]
}

function normalize(d) {
    const cols = d.cols || []
    if (d.rows) return { cols, rows: d.rows }

    const rows = []
    const events = d.events || []

    events.forEach(e => {
        const date = String(e.date ?? e.year)
        let row = rows.find(r => r.date === date && !!r.global === !!e.global)
        if (!row) {
            row = e.global ? { date, global: [] } : { date, cells: cols.map(() => []) }
            rows.push(row)
        }
        const ev = { title: e.title, detail: e.detail }
        if (e.global) row.global.push(ev)
        else row.cells[Math.max(0, cols.indexOf(e.col))].push(ev)
    })

    return { cols, rows }
}
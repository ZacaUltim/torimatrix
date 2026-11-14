let navbarContent = [
    { text: "Load", onclick: () => pickFile(loadTopic) },
    { text: "Database", onclick: () => showDatabase() },
    { text: "Editor", onclick: () => location.href = "editor.html" },
]

async function showDatabase() {
    const p = get("cont-2")
    p.onclick = null

    try {
        const names = await (await fetch("topics/topics.json")).json()
        p.innerHTML = `<div class="date">Database</div>` + names.map(n => `<input type="button" class="basic-btn" data-n="${n}" value="${n}">`).join("<br>")

        p.onclick = async e => {
            const n = e.target.dataset.n
            if (n) loadTopic(normalize(await (await fetch(`topic/${n}.json`)).json()))
        }
    } catch (e) {
        p.innerHTML = "<h2>cant load database</h2><p>" + e.message + "</p>"
    }
}

function loadTopic(data) {
    saveData(data)
    genTimeline(data)
    get("cont-2").innerHTML = ""
}

function showCell(date, list, active = 0) {
    const tabs = list.length > 1
        ? `<div class="tabs">${list.map((e, i) => `<div class="tab${i === active ? " active" : ""}" data-t="${i}">${e.title}</div>`).join("")}</div>`
        : ""

    get("cont-2").innerHTML = `<div class="date">Date: ${formatDate(date)}</div>${tabs}<div>${list[active].detail}</div>`

    get("cont-2").onclick = e => {
        const t = e.target.closest(".tab")
        if (t) showCell(date, list, Number(t.dataset.t))
    }
}

function genTimeline(data) {
    const { cols } = data
    const rows = data.rows.slice().sort((a, b) => dateCmp(a.date, b.date))

    const cell = (list, r, c, g) => list.length
        ? `<td class="cell" colspan="${g ? cols.length : 1}" data-r="${r}" data-c="${c}">${list.map(e => `<div class="ev${g ? " global" : ""}">${e.title}</div>`).join("")}</td>`
        : `<td class="empty" colspan="${g ? cols.length : 1}">x</td>`

    let html = `<table class="timeline"><tr><th></th>${cols.map(c => `<th>${c}</th>`).join("")}</tr>`

    rows.forEach((row, r) => {
        html += `<tr><th>${formatDate(row.date)}</th>`
        html += row.global
            ? cell(row.global, r, 0, true)
            : cols.map((c, i) => cell(row.cells[i] || [], r, i, false)).join("")
        html += `</tr>`
    })

    let cont = get("cont-1")
    cont.innerHTML = html + "</table>"

    cont.onclick = e => {
        const td = e.target.closest("td.cell")
        if (!td) return
        const row = rows[td.dataset.r]
        showCell(row.date, row.global || row.cells[td.dataset.c])
    }
}

genNavbar(navbarContent)

const saved = loadData()
if (saved) loadTopic(saved)
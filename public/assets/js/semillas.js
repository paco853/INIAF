;(function(){
  function init(){
    var sidebar = document.getElementById('sidebar')
    var toggle = document.getElementById('toggleSidebar')
    var hide = document.getElementById('hideSidebar')

    function collapse(){
      sidebar && sidebar.classList.add('collapsed')
      document.body.classList.add('sidebar-collapsed')
      document.body.classList.remove('sidebar-open')
    }
    function expand(){
      sidebar && sidebar.classList.remove('collapsed')
      document.body.classList.remove('sidebar-collapsed')
      document.body.classList.add('sidebar-open')
    }
    function toggleFn(){
      if (document.body.classList.contains('sidebar-collapsed') || (sidebar && sidebar.classList.contains('collapsed'))){
        expand()
      } else {
        collapse()
      }
    }

    toggle && toggle.addEventListener('click', toggleFn)
    hide && hide.addEventListener('click', collapse)

    // Start collapsed on small screens
    if (window.matchMedia('(max-width: 900px)').matches){ collapse() }

    // Enhance: live compute for Registro de Recepcion
    try {
      var form = document.getElementById('formRecepcion')
      if (form){
        var nlab = document.getElementById('nlab')
        var especie = document.getElementById('especie')
        var latin = document.getElementById('latin')
        var cooperador = document.getElementById('cooperador')
        var lote = document.getElementById('lote')
        var bolsas = document.getElementById('bolsas')
        var kgbol = document.getElementById('kgbol')
        var total = document.getElementById('total')
        var catIni = document.getElementById('categoria_inicial')
        var catFin = document.getElementById('categoria_final')
        var variedad = document.getElementById('variedad')
        var varHint = document.getElementById('variedadHint')
        var varAddLink = document.getElementById('variedadAddLink')

        var computeUrl = form.getAttribute('data-compute-url')
        var suggestUrl = form.getAttribute('data-suggest-url')
        var varSuggestUrl = form.getAttribute('data-var-suggest-url')
        var csrf = form.getAttribute('data-csrf')
        var varCreateUrl = form.getAttribute('data-var-create-url')
        var regUrl = form.getAttribute('data-reg-url')
        var timer = null

        function schedule(){
          if (!computeUrl || !csrf) return
          clearTimeout(timer)
          timer = setTimeout(doCompute, 180)
        }

        async function doCompute(){
          try{
            var payload = {
              especie: especie ? especie.value : '',
              cooperador: cooperador ? cooperador.value : '',
              nlab: nlab ? nlab.value : '',
              bolsas: bolsas ? bolsas.value : '',
              kgbol: kgbol ? kgbol.value : ''
            }
            var res = await fetch(computeUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf,
                'Accept': 'application/json'
              },
              body: JSON.stringify(payload)
            })
            if (!res.ok) return
            var data = await res.json()
            if (latin && typeof data.latin === 'string') latin.value = data.latin
            if (lote && typeof data.lote === 'string') lote.value = data.lote
            if (total && typeof data.total === 'string') total.value = data.total
          } catch (e) {
            // fail silent
          }
        }

        especie && especie.addEventListener('input', schedule)
        
        // Cuando Especie es un <select>, auto-rellenar Inicial/Final y cargar variedades
        if (especie && especie.tagName === 'SELECT'){
          especie.addEventListener('change', function(){
            try{
              var opt = especie.options[especie.selectedIndex]
              if (opt){
                if (catIni && typeof opt.dataset.inicial !== 'undefined'){ catIni.value = opt.dataset.inicial || '' }
                if (catFin && typeof opt.dataset.final !== 'undefined'){ catFin.value = opt.dataset.final || '' }
              }
            } catch(e){}
            // cargar variedades de la especie seleccionada
            loadVariedadesForEspecie()
            schedule()
          })
          // Carga inicial (por si hay old values)
          loadVariedadesForEspecie(true)
        }
        cooperador && cooperador.addEventListener('input', schedule)
        nlab && nlab.addEventListener('input', schedule)
        bolsas && bolsas.addEventListener('input', schedule)
        kgbol && kgbol.addEventListener('input', schedule)
        // initial compute once
        schedule()

        // Autocomplete de especie (sugerencias) — no-op cuando se usa <select>
        try {
          var suggestBox = document.getElementById('especieSuggest')
          var suggestTimer = null
          var toggleBtn = document.getElementById('especieToggleBtn')

          function clearSuggest(){ if (suggestBox){ suggestBox.style.display = 'none'; suggestBox.innerHTML = '' } }
          function renderSuggestNames(items){
            if (!suggestBox) return
            if (!items || !items.length){ clearSuggest(); return }
            var html = '<div class="select-dropdown__header">Seleccione un cultivo</div>' +
              items.map(function(it, idx){
                return '<div class="_opt select-dropdown__option" data-i="'+idx+'" role="option">'+escapeHtml(it.especie || '')+'</div>'
              }).join('')
            suggestBox.innerHTML = html
            suggestBox.style.display = 'block'
            Array.prototype.forEach.call(suggestBox.querySelectorAll('._opt'), function(el){
              el.addEventListener('mousedown', function(e){
                e.preventDefault()
                var idx = parseInt(el.getAttribute('data-i') || '0', 10)
                var it = items[idx]
                if (especie && it && it.especie){ especie.value = it.especie }
                if (catIni && it){ catIni.value = (it.categoria_inicial || '') }
                if (catFin && it){ catFin.value = (it.categoria_final || '') }
                clearSuggest()
                schedule()
              })
            })
        }

        // Cargar variedades desde backend y poblar <select>
        async function loadVariedadesForEspecie(useOld){
          try{
            if (!variedad) return
            var especieName = ''
            var cultivoId = ''
            if (especie){
              if (especie.tagName === 'SELECT'){
                var opt = especie.options[especie.selectedIndex]
                especieName = opt ? (opt.value || '') : ''
                cultivoId = opt && opt.dataset ? (opt.dataset.cultivoId || '') : ''
              } else {
                especieName = especie.value || ''
              }
            }
            if (!especieName || !varSuggestUrl){
              variedad.innerHTML = ''
              try{ variedad.disabled = true; variedad.required = false }catch(e){}
              if (varHint){ varHint.style.display = 'none' }
              return
            }
            var url = varSuggestUrl + '?especie=' + encodeURIComponent(especieName) + (cultivoId ? ('&cultivo_id=' + encodeURIComponent(cultivoId)) : '') + '&limit=50'
            var res = await fetch(url, { headers: { 'Accept': 'application/json' } })
            if (!res.ok){ variedad.innerHTML = '<option value="">Seleccione una variedad</option>'; return }
            var data = await res.json()
            var items = (data && data.items) || []
            if (!items.length){
              variedad.innerHTML = '<option value="">No hay variedades para esta especie</option>'
              try{ variedad.disabled = true; variedad.required = false }catch(e){}
              if (varHint){
                try{
                  if (varAddLink && varCreateUrl){
                    var url = varCreateUrl
                    var q = []
                    if (cultivoId){ q.push('cultivo_id=' + encodeURIComponent(cultivoId)) }
                    // redirect back to registro with especie preseleccionada
                    if (regUrl && especieName){ q.push('redirect_to=' + encodeURIComponent(regUrl + '?especie=' + encodeURIComponent(especieName))) }
                    if (q.length){ url += '?' + q.join('&') }
                    varAddLink.href = url
                  }
                }catch(e){}
                varHint.style.display = 'block'
              }
            } else {
              var options = []
              for (var i=0; i<items.length; i++){
                var nombre = items[i] && items[i].nombre ? String(items[i].nombre) : ''
                if (!nombre) continue
                options.push('<option value="'+escapeHtml(nombre)+'">'+escapeHtml(nombre)+'</option>')
              }
              variedad.innerHTML = options.join('')
              try{ variedad.disabled = false; variedad.required = true }catch(e){}
              if (varHint){ varHint.style.display = 'none' }
              // Select previously requested value or default to first option
              var targetVal = (variedad.getAttribute('data-old-value') || '').trim()
              if (targetVal) {
                try{ variedad.value = targetVal }catch(e){}
              }
              if (!variedad.value && items.length){
                try{ variedad.value = items[0].nombre || '' }catch(e){}
              }
            }
            if (useOld){
              var oldVal = variedad.getAttribute('data-old-value') || ''
              if (oldVal){
                try{ variedad.value = oldVal }catch(e){}
              }
            }
          } catch(e){ /* silent */ }
        }

          function renderSuggest(items){
            if (!suggestBox) return
            if (!items || !items.length){ clearSuggest(); return }
            var html = items.map(function(it, idx){
              var ini = (it.categoria_inicial || '').toString().trim()
              var fin = (it.categoria_final || '').toString().trim()
              var meta = [ini && ('Inicial: '+ini), fin && ('Final: '+fin)].filter(Boolean).join(' � ')
              return '<div class="_opt" data-i="'+idx+'" style="padding:8px 10px; cursor:pointer; display:flex; flex-direction:column; gap:2px">\
                <div style="font-size:14px; color:#0f172a">'+escapeHtml(it.especie || '')+'</div>\
                <div style="font-size:12px; color:#6b7280">'+escapeHtml(meta)+'</div>\
              </div>'
            }).join('')
            suggestBox.innerHTML = html
            suggestBox.style.display = 'block'
            // attach click
            Array.prototype.forEach.call(suggestBox.querySelectorAll('._opt'), function(el){
              el.addEventListener('mousedown', function(e){ // mousedown to beat input blur
                e.preventDefault()
                var idx = parseInt(el.getAttribute('data-i') || '0', 10)
                var it = items[idx]
                if (especie && it && it.especie){ especie.value = it.especie }
                if (catIni && it){ catIni.value = (it.categoria_inicial || '') }
                if (catFin && it){ catFin.value = (it.categoria_final || '') }
                clearSuggest()
                schedule()
              })
            })
          }

          function fetchSuggest(forceAll){
            clearTimeout(suggestTimer)
            if (!suggestUrl || !especie){ clearSuggest(); return }
            var q = (forceAll ? "" : (especie.value||"").trim())
            suggestTimer = setTimeout(async function(){
              try{
                var res = await fetch(suggestUrl + '?q=' + encodeURIComponent(q) + '&limit=' + (forceAll ? 20 : 10), { headers: { 'Accept': 'application/json' } })
                if (!res.ok) return
                var data = await res.json()
                renderSuggestNames((data && data.items) || [])
              } catch(e){ /* silent */ }
            }, 150)
          }

          function escapeHtml(s){
            return (s || '').replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]) })
          }

          if (especie){
            // Solo ocultar al perder foco; mostrar con el botón
            especie.addEventListener('blur', function(){ setTimeout(clearSuggest, 120) })
          }
          if (toggleBtn){ toggleBtn.addEventListener('click', function(){ try{ if (!suggestBox) return; var open = suggestBox.style.display === 'block' && (suggestBox.innerHTML||'').trim() !== ''; if (open){ suggestBox.style.display = 'none'; suggestBox.innerHTML = ''; } else { especie && especie.focus(); fetchSuggest(true); } } catch(e){} }); }
                    // --- Variedades dropdown ---
          try {
            var varSuggestBox = document.getElementById('variedadSuggest')
            var varToggleBtn = document.getElementById('variedadToggleBtn')
            var variedad = document.getElementById('variedad')
            var varSuggestUrl = form.getAttribute('data-var-suggest-url')
            var varTimer = null

            function clearVarSuggest(){ if (varSuggestBox){ varSuggestBox.style.display = 'none'; varSuggestBox.innerHTML = '' } }
            function renderVarNames(items){
              if (!varSuggestBox) return
              if (!items || !items.length){ clearVarSuggest(); return }
              var html = '<div class="select-dropdown__header">Seleccione una variedad</div>' +
                items.map(function(it, idx){
                  return '<div class="_opt select-dropdown__option" data-i="'+idx+'" role="option">'+escapeHtml(it.nombre || '')+'</div>'
                }).join('')
              varSuggestBox.innerHTML = html
              varSuggestBox.style.display = 'block'
              Array.prototype.forEach.call(varSuggestBox.querySelectorAll('._opt'), function(el){
                el.addEventListener('mousedown', function(e){
                  e.preventDefault()
                  var idx = parseInt(el.getAttribute('data-i') || '0', 10)
                  var it = items[idx]
                  if (variedad && it && it.nombre){ variedad.value = it.nombre }
                  clearVarSuggest()
                })
              })
            }

            function fetchVarSuggest(forceAll, qOverride){
              clearTimeout(varTimer)
              if (!varSuggestUrl) { clearVarSuggest(); return }
              var especieName = (especie && typeof especie.value === 'string') ? especie.value.trim() : ''
              if (!especieName){ clearVarSuggest(); return }
              var q = (typeof qOverride === 'string' ? qOverride : (forceAll ? '' : (variedad && variedad.value || '').trim()))
              varTimer = setTimeout(async function(){
                try{
                  var url = varSuggestUrl + '?especie=' + encodeURIComponent(especieName) + '&q=' + encodeURIComponent(q) + '&limit=' + (forceAll ? 20 : 10)
                  var res = await fetch(url, { headers: { 'Accept': 'application/json' } })
                  if (!res.ok) return
                  var data = await res.json()
                  renderVarNames((data && data.items) || [])
                } catch(e){ /* silent */ }
              }, 150)
            }

            if (variedad){
              variedad.addEventListener('blur', function(){ setTimeout(clearVarSuggest, 120) })
            }
            if (varToggleBtn){
              varToggleBtn.addEventListener('click', function(){
                try{
                  if (!varSuggestBox) return
                  var open = varSuggestBox.style.display === 'block' && (varSuggestBox.innerHTML||'').trim() !== ''
                  if (open){ varSuggestBox.style.display = 'none'; varSuggestBox.innerHTML = '' }
                  else { variedad && variedad.focus(); fetchVarSuggest(true) }
                } catch(e){}
              })
            }
          } catch (e) { /* ignore variedades suggest errors */ }
          document.addEventListener('keydown', function(ev){
            if (ev.key === 'Escape') clearSuggest()
          })
        } catch (e) { /* ignore suggest errors */ }
      }
    } catch (e) {
      // ignore
    }

    // Hover behavior handled via CSS
  }

  // Expose initializer (used as fallback in the blade)
  window.__initSemillas = init
  // Autostart when script loads
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})();







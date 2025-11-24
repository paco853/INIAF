</div> <!-- /.report-body -->
</div> <!-- /.wrap -->

@if($isPreview)
  <div class="copy-info" style="position: fixed; left:10mm; right:10mm; bottom:2mm; text-align:left; font-size:8px; white-space:pre-line;">
    ORIGINAL: INTERESADO <br>
    1ra. Copia Amarillo: Arch. Laboratorio <br>
    2da. Copia Celeste: Administración
  </div>
@endif

@if(request()->boolean('autoprint'))
  <script>
    window.addEventListener('load', function(){
      setTimeout(function(){
        try { window.print(); } catch(e) {}
      }, 150);
    });
  </script>
@endif
</body>
</html>

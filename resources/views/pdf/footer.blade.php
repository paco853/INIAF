@if(!empty($footerCss))
<style>
{!! $footerCss !!}
</style>
@endif
<div class="pdf-footer">
  <div class="pdf-footer__signatures">
    <div class="pdf-footer__signature-row">
      <div class="pdf-footer__signature">
        <div class="pdf-footer__signature-line"></div>
        <div class="pdf-footer__signature-text">FIRMA TÉCNICO LABORATORIO</div>
      </div>
      <div class="pdf-footer__signature">
        <div class="pdf-footer__signature-line"></div>
        <div class="pdf-footer__signature-text">FIRMA ENCARGADO SEMILLAS</div>
      </div>
      <div class="pdf-footer__signature">
        <div class="pdf-footer__signature-line"></div>
        <div class="pdf-footer__signature-text">V°B° RESP. DEPARTAMENTAL INIAF <br>  APROBADO </div>
      </div>
    </div>
  </div>
  <div class="pdf-footer__info">
    <div class="pdf-footer__copies">
      ORIGINAL: INTERESADO<br>
      1ra. Copia Amarillo: Arch. Laboratorio<br>
      2da. Copia Celeste: Administración
    </div>
    <div class="pdf-footer__bottom">
      <span>DIRECCIÓN DEPARTAMENTAL</span>
      <span>www.iniaf.gob.bo</span>
    </div>
  </div>
  <div class="pdf-footer__spacer"></div>
</div>

/**
 * A luz violeta que acompanha o ponteiro, atrás de tudo.
 *
 * ## Por que ela fica no fundo, e não por cima
 *
 * Esta é a decisão que faz o efeito valer alguma coisa aqui. Os cartões da
 * página têm `backdrop-filter`, ou seja, eles borram e entortam **o que está
 * atrás deles**. Até agora não havia nada atrás que valesse a pena entortar: o
 * fundo é quase preto e o campo de estrelas é rarefeito, e a medição mostrou
 * que a refração alterava menos de 1% dos pixels do cartão. O vidro estava lá,
 * mas não tinha o que refratar.
 *
 * Com a luz nesta camada — acima das estrelas, abaixo do conteúdo — ela passa
 * pelo `backdrop-filter` de cada cartão no caminho até os olhos. O cartão não
 * precisa saber que a luz existe: ele já borra e desloca o que estiver atrás.
 * Onde a luz cruza um cartão, o vidro finalmente mostra que é vidro.
 *
 * Por isso ela **não** é um cursor pintado por cima da página. Uma luz por cima
 * cobriria o texto e passaria na frente do vidro em vez de atravessá-lo, que é
 * o oposto do efeito.
 *
 * ## As duas camadas
 *
 * O campo largo é a atmosfera: quase invisível sozinho, é ele que faz a página
 * parecer iluminada de um lado. O núcleo é curto e um pouco mais claro, e é o
 * que dá ao conjunto um ponto de origem em vez de uma mancha.
 *
 * `screen` nas duas: sobre um fundo escuro, luz se soma. Com composição normal
 * o violeta cobriria as estrelas em vez de acender junto com elas, e o campo
 * ficaria com um véu leitoso onde deveria ficar mais claro.
 *
 * A opacidade do conjunto é `--luz-forca`, que o laço leva a zero quando o
 * ponteiro sai da janela. Sem isso a luz fica esquecida na última posição.
 */
export default function LuzDoPonteiro() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ opacity: 'var(--luz-forca, 0)' }}
    >
      <div
        className="absolute inset-0"
        style={{
          mixBlendMode: 'screen',
          background:
            'radial-gradient(250px circle at var(--luz-x, 50%) var(--luz-y, 38%), rgba(150,110,255,0.26) 0%, rgba(133,102,255,0.13) 34%, rgba(124,58,237,0.045) 62%, rgba(124,58,237,0) 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          mixBlendMode: 'screen',
          background:
            'radial-gradient(80px circle at var(--luz-x, 50%) var(--luz-y, 38%), rgba(196,181,253,0.17) 0%, rgba(167,139,250,0.07) 45%, rgba(167,139,250,0) 100%)',
        }}
      />
    </div>
  )
}

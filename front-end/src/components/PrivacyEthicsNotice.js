import { useState } from 'react';
import './PrivacyEthicsNotice.css';

export default function PrivacyEthicsNotice({ children }) {
  const [accepted, setAccepted] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleAccept = () => {
    if (!checked) return;
    setAccepted(true);
  };

  if (accepted) {
    return children;
  }

  return (
    <dialog open className="privacy-ethics-overlay" aria-labelledby="privacy-ethics-title">
      <div className="privacy-ethics-modal">
        <h2 id="privacy-ethics-title" className="privacy-ethics-title">
          Aviso de privacidade e ética
        </h2>
        <div className="privacy-ethics-content">
          <p>
            O <strong>FindThem</strong> é uma ferramenta de apoio à identificação de pessoas desaparecidas,
            utilizando reconhecimento facial. Ao utilizar este sistema, você declara estar ciente e em acordo
            com o seguinte:
          </p>
          <ul>
            <li>
              <strong>Privacidade:</strong> As imagens e dados cadastrados serão processados por sistemas
              automatizados (incluindo extração de características faciais) exclusivamente para fins de
              comparação e possíveis correspondências. Os dados devem ser tratados com confidencialidade
              e em conformidade com a legislação aplicável (ex.: LGPD).
            </li>
            <li>
              <strong>Ética e respeito às famílias:</strong> O uso do sistema deve ser pautado pelo respeito
              às pessoas desaparecidas e às suas famílias. Os resultados de similaridade são indicativos e
              exigem <strong>revisão humana</strong>; não constituem identificação definitiva. Evite uso
              sensacionalista ou que cause dano às famílias.
            </li>
            <li>
              <strong>Finalidade:</strong> O FindThem destina-se a auxiliar na busca e reunificação,
              em contexto de autoridade competente ou de uso responsável, nunca para vigilância em massa
              ou fins incompatíveis com os direitos das pessoas.
            </li>
          </ul>
          <p className="privacy-ethics-footer">
            Ao continuar, você confirma que leu e concorda com este aviso.
          </p>
        </div>
        <div className="privacy-ethics-actions">
          <label className="privacy-ethics-checkbox">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              aria-describedby="privacy-ethics-title"
            />
            <span>Li e concordo com o aviso de privacidade e ética</span>
          </label>
          <button
            type="button"
            className="privacy-ethics-btn"
            onClick={handleAccept}
            disabled={!checked}
          >
            Continuar
          </button>
        </div>
      </div>
    </dialog>
  );
}

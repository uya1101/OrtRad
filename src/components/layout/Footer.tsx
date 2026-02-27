import React from 'react';
import { useTranslation } from 'react-i18next';
import { T } from '../../constants/tokens';
import Dot from '../common/Dot';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer style={{
      position: "relative", zIndex: 10,
      background: T.bgSurface,
      borderTop: `1px solid ${T.border}`,
      padding: "24px",
      marginTop: 60,
    }}>
      <div style={{
        maxWidth: 1300, margin: "0 auto",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Dot color={T.neonGreen} label={t('common.online')} />
        </div>
        <span style={{
          fontFamily: "'Share Tech Mono',monospace",
          fontSize: "0.55rem",
          color: T.textDim,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}>
          {t('footer.copyright')}
        </span>
        <span style={{
          fontFamily: "'Share Tech Mono',monospace",
          fontSize: "0.52rem",
          color: T.textDim,
          letterSpacing: "0.06em",
        }}>
          Orthopedic Radiology Intelligence Hub v2.1
        </span>
      </div>
    </footer>
  );
}

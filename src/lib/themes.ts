import { ThemeConfig } from 'antd';

const shadow = '0 4px 5px rgba(0, 0, 0, 0.25)';

const defaultButton = {
  defaultBg: 'rgb(207, 207, 207)',
  defaultShadow: '0 4px 5px rgba(0, 0, 0, 0.25)',
  defaultBorderColor: 'rgb(207, 207, 207)',
  primaryShadow: shadow,
};

export const greenThemeColors = {
  ...defaultButton,
  colorPrimary: `#9EFF00`,
  colorPrimaryBg: '#f9ffe6',
  colorPrimaryBgHover: '#e8ffa3',
  colorPrimaryBorder: '#d9ff7a',
  colorPrimaryBorderHover: '#c8ff52',
  colorPrimaryHover: '#b4ff29',
  colorPrimaryActive: '#7ed900',
  colorPrimaryTextHover: '#b4ff29',
  colorPrimaryText: '#9eff00',
  colorPrimaryTextActive: '#7ed900',
};
export const cardThemeConfig = {
  colorBorderSecondary: '#CFCFCF',
  colorBgContainer: '#EEEDED',
};
export const mainThemeConfig: ThemeConfig = {
  components: {
    Button: defaultButton,
    Card: cardThemeConfig,
    Layout: {
      bodyBg: 'rgb(255, 255, 255)',
      footerPadding: 0,
    },
  },
};

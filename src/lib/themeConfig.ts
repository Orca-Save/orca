import { ThemeConfig } from 'antd';

const shadow = '0 4px 5px rgba(0, 0, 0, 0.25)';

const defaultButton = {
  defaultBg: '#cfcfcf',
  defaultHoverColor: 'black',
  defaultShadow: '0 4px 5px rgba(0, 0, 0, 0.25)',
  defaultBorderColor: 'rgb(207, 207, 207)',
  defaultHoverBorderColor: 'rgb(207, 207, 207)',
  primaryShadow: shadow,
};

export const antdDefaultButton = {
  defaultBg: '#FFFFFF',
  defaultHoverColor: '#4096FF',
  defaultShadow: '0 2px 0 rgba(0, 0, 0, 0.02)',
  defaultBorderColor: '#D9D9D9',
  defaultHoverBorderColor: '#4096FF',
  primaryShadow: '0 2px 0 rgba(5, 145, 255, 0.1)',
};

export const impulseButtonTheme = {
  ...antdDefaultButton,
  colorPrimary: 'rgba(154,0,207, 0.2)',
  colorPrimaryHover: 'rgba(154,0,207, 0.6)',
  defaultHoverBorderColor: '#9A00CF',
  defaultHoverColor: '#9A00CF',
  primaryColor: '#9A00CF',
};

export const impulseDefaultButtonTheme = {
  ...antdDefaultButton,
  defaultBg: 'rgba(154,0,207, 0.2)',
  colorPrimaryHover: 'rgba(154,0,207, 0.6)',
  defaultHoverBorderColor: '#9A00CF',
  defaultHoverColor: '#9A00CF',
  defaultShadow: '0 4px 5px rgba(0, 0, 0, 0.25)',
  colorText: '#9A00CF',
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
export const defaultCardThemeConfig = {
  colorBorderSecondary: '#CFCFCF',
  colorBgContainer: '#EEEDED',
};
export const greenCardThemeConfig: ThemeConfig['components'] = {
  Card: {
    // colorBorderSecondary: '#CFCFCF',
    colorBgContainer: '#F0FFD8',
    colorBorderSecondary: 'transparent',
  },
  Typography: {
    colorText: '#34A853',
  },
};
export const mainThemeConfig: ThemeConfig = {
  token: {
    fontSize: 16,
  },
  components: {
    Button: {
      ...defaultButton,
    },
    Card: defaultCardThemeConfig,
    Layout: {
      bodyBg: 'rgb(255, 255, 255)',
      footerPadding: 0,
    },
  },
};

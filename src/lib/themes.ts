import { ThemeConfig } from "antd";

export const greenThemeColors = {
  colorPrimary: `#9EFF00`,
  colorPrimaryBg: "#f9ffe6",
  colorPrimaryBgHover: "#e8ffa3",
  colorPrimaryBorder: "#d9ff7a",
  colorPrimaryBorderHover: "#c8ff52",
  colorPrimaryHover: "#b4ff29",
  colorPrimaryActive: "#7ed900",
  colorPrimaryTextHover: "#b4ff29",
  colorPrimaryText: "#9eff00",
  colorPrimaryTextActive: "#7ed900",
};
export const mainThemeConfig: ThemeConfig = {
  token: {
    // colorBgBase: "rgb(207, 207, 207)",
  },
  components: {
    Button: {
      defaultBg: "rgb(207, 207, 207)",
      defaultShadow: "0 2px 0 rgba(0, 0, 0, 0.2)",
      defaultBorderColor: "rgb(207, 207, 207)",
      //   defaultHoverBorderColor: "rgb(160, 160, 160)",
    },
    Card: {
      colorBgContainer: "rgb(207, 207, 207)",
    },
    // Layout: {
    // //   headerBg: "rgb(207, 207, 207)",
    // },
    Layout: {
      bodyBg: "rgb(255, 255, 255)",
      footerPadding: 0,
    },
  },

  //    0 2px 0 rgba(0, 0, 0, 0.2)
};

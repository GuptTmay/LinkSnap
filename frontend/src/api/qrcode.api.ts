import { apiRequest } from "./client";


// export const createQrCode = async (
//   linkId: string,
//   customization?: {
//     color?: string;
//     backgroundColor?: string;
//     size?: number;
//     logoUrl?: string;
//   }
// ) => {
//   return apiRequest(`/links/${linkId}/qrcode`, {
//     method: "POST",
//     body: JSON.stringify({
//       customization,
//     }),
//   });
// };

export const createQrCode = async (linkId: string, customization: Object) => {
  return apiRequest(`/links/${linkId}/qrcode`, {
    method: "POST",
    body: JSON.stringify({
      customization,
    }),
  });
};

export const getQrCodes = async () => {
  return apiRequest("/links/qrcode", {
    method: "GET",
  });
};



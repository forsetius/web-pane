export const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/127.0.0.0 Safari/537.36';

export const CLIENT_HINTS: Record<string, string> = {
  'Sec-CH-UA':
    '"Not?A_Brand";v="99", "Chromium";v="127", "Google Chrome";v="127"',
  'Sec-CH-UA-Mobile': '?0',
  'Sec-CH-UA-Platform': '"Windows"',
  'Sec-CH-UA-Full-Version': '"127.0.0.0"',
  'Sec-CH-UA-Full-Version-List':
    '"Chromium";v="127.0.0.0", "Google Chrome";v="127.0.0.0", "Not?A_Brand";v="99.0.0.0"',
  'Sec-CH-UA-Platform-Version': '"10.0.0"',
  'Sec-CH-UA-Arch': '"x86"',
};

import ftp from "basic-ftp";
import "dotenv/config";

function toHexString(dec) {
  var hex = "";
  var n = dec;
  do {
    var n2 = Math.floor(n / 16);
    var n1 = n - n2 * 16;
    n = n2;

    var hex_char = "";
    if (n1 >= 10) {
      switch (n1) {
        case 10:
          hex_char = "a";
          break;
        case 11:
          hex_char = "b";
          break;
        case 12:
          hex_char = "c";
          break;
        case 13:
          hex_char = "d";
          break;
        case 14:
          hex_char = "e";
          break;
        case 15:
          hex_char = "f";
          break;
      }
    } else {
      hex_char = n1.toString();
    }

    hex = hex_char + hex;
  } while (n > 0);

  return hex;
}

function generateGUID() {
  function Random() {
    return toHexString(Math.floor((1 + Math.random()) * 65536)).substring(1);
  }
  return (
    Random() +
    Random() +
    Random() +
    Random() +
    Random() +
    Random() +
    Random() +
    Random()
  );
}

async function getIdDocument() {
  const documentID = generateGUID();

  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    await client.access({
      host: process.env.NEXT_PUBLIC_FTP_HOST,
      user: process.env.NEXT_PUBLIC_FTP_USER,
      password: process.env.NEXT_PUBLIC_FTP_PASSWORD,
      secure: false,
      port: process.env.NEXT_PUBLIC_FTP_PORT_POST,
    });

    // Загрузка файла
    await client.uploadFrom("name_file.pdf", `/ftpopt/${documentID}.pdf`);
    console.log(`Документ № ${documentID}  успешно загружен.`);

    return documentID;
  } catch (err) {
    console.log(`Ошибка: ${err.message}`);
  } finally {
    client.close();
  }
}

async function getDocumentData(url) {
  const data = {
    Id: getIdDocument(),
    Preview: true,
    PResolution: 200,
  };
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  console.log(data.Id);

  // if (response.json()?.Body) {
  return response.json();
  // }
  // else {
  //     console.log('Ответ пустой, повторяем запрос:', response.json());
  //     setTimeout(getDocumentData, 1000);
  // }
}

getDocumentData(
  `http://${process.env.NEXT_PUBLIC_FTP_HOST}:${process.env.NEXT_PUBLIC_FTP_PORT_GET}/api/v1/pdf/getinfo`
).then((data) => console.log(data));

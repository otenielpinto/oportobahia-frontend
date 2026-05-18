implemente tela para exibir as notas fiscais emitidas, permitindo ao usuário visualizar detalhes como número da nota, data de emissão, valor total e status. A tela deve incluir opções para filtrar as notas por período, status e tipo de nota (entrada ou saída). Além disso, deve ser possível clicar em cada nota para acessar uma visão detalhada com informações adicionais, como itens incluídos na nota, dados do cliente ou fornecedor e histórico de alterações.

colunas para exibir :
numero, serie, data_emissao ,nome, natOp, valor_produtos, valor_frete , valor , descricao_situacao, chave_acesso

segue modelo de nota fiscal da collection "nota_fiscal"
{
"\_id": {
"$oid": "69aca2b152e2d6a69e3a7bec"
  },
  "id": "855425807",
  "chave_acesso": "35260333268082000109550030000051211554258078",
  "cliente": {
    "nome": "OPORTO DA MUSICA LTDA",
    "tipo_pessoa": "J",
    "cpf_cnpj": "63.564.727/0001-11",
    "ie": "156699260111",
    "endereco": "AVENIDA ENG HEITOR ANTONIO EIRAS GARCIA",
    "numero": "1010",
    "complemento": "SUBSL 1",
    "bairro": "JARDIM ESMERALDA",
    "cep": "05.588-001",
    "cidade": "SAO PAULO",
    "uf": "SP",
    "fone": "",
    "email": "contato@oportodamusica.com.br"
  },
  "codigo_rastreamento": "",
  "data_emissao": "07/03/2026",
  "data_movto": {
    "$date": "2026-03-07T03:00:00.000Z"
},
"descricao_situacao": "Autorizada",
"endereco_entrega": {
"tipo_pessoa": "J",
"cpf_cnpj": "63.564.727/0001-11",
"endereco": "AVENIDA ENG HEITOR ANTONIO EIRAS GARCIA",
"numero": "1010",
"complemento": "SUBSL 1",
"bairro": "JARDIM ESMERALDA",
"cep": "05.588-001",
"cidade": "SAO PAULO",
"uf": "SP",
"fone": "",
"nome_destinatario": "OPORTO DA MUSICA LTDA"
},
"id_forma_envio": "",
"id_forma_frete": "",
"id_vendedor": "0",
"nome": "OPORTO DA MUSICA LTDA",
"nome_vendedor": "",
"numero": "005121",
"numero_ecommerce": null,
"serie": "3",
"situacao": "6",
"sys_status": 1,
"sys_xml": 1,
"tipo": "S",
"tipoVenda": "V",
"transportador": {
"nome": ""
},
"updated_at": {
"$date": "2026-03-07T22:12:02.030Z"
  },
  "url_rastreamento": "",
  "valor": "4450.07",
  "valor_frete": "0.00",
  "valor_produtos": "4450.07",
  "ICMSTot": {
    "vBC": "0.00",
    "vICMS": "0.00",
    "vICMSDeson": "0.00",
    "vFCPUFDest": "0.00",
    "vICMSUFDest": "0.00",
    "vICMSUFRemet": "0.00",
    "vFCP": "0.00",
    "vBCST": "0.00",
    "vST": "0.00",
    "vFCPST": "0.00",
    "vFCPSTRet": "0.00",
    "vProd": "4450.07",
    "vFrete": "0.00",
    "vSeg": "0.00",
    "vDesc": "0.00",
    "vII": "0.00",
    "vIPI": "0.00",
    "vIPIDevol": "0.00",
    "vPIS": "28.93",
    "vCOFINS": "133.53",
    "vOutro": "0.00",
    "vNF": "4450.07",
    "vTotTrib": "1525.07"
  },
  "itens": [
    {
      "prod": {
        "cProd": "0075678373824",
        "cEAN": "0075678373824",
        "xProd": "RUSH - COUNTERPARTS (2004 REMASTER) - 0075678373824",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "PECA",
        "qCom": "5.0000",
        "vUnCom": "24.71",
        "vProd": "123.55",
        "cEANTrib": "0075678373824",
        "uTrib": "PECA",
        "qTrib": "5.0000",
        "vUnTrib": "24.71",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -"
      },
      "imposto": {
        "vTotTrib": "42.34",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "123.55",
            "pPIS": "0.65",
            "vPIS": "0.80"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "123.55",
            "pCOFINS": "3.00",
            "vCOFINS": "3.71"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "0040141951076",
        "cEAN": "0040141951076",
        "xProd": "SAXON - CRUSADER - 0040141951076",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "PECA",
        "qCom": "2.0000",
        "vUnCom": "33.70",
        "vProd": "67.40",
        "cEANTrib": "0040141951076",
        "uTrib": "PECA",
        "qTrib": "2.0000",
        "vUnTrib": "33.70",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -"
      },
      "imposto": {
        "vTotTrib": "23.10",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "67.40",
            "pPIS": "0.65",
            "vPIS": "0.44"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "67.40",
            "pCOFINS": "3.00",
            "vCOFINS": "2.02"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "7898960689273",
        "cEAN": "7898960689273",
        "xProd": "SAXON - INNOCENCE IS NO EXCUSE -7898960689273",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "PECA",
        "qCom": "12.0000",
        "vUnCom": "33.70",
        "vProd": "404.40",
        "cEANTrib": "7898960689273",
        "uTrib": "PECA",
        "qTrib": "12.0000",
        "vUnTrib": "33.70",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -"
      },
      "imposto": {
        "vTotTrib": "138.59",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "404.40",
            "pPIS": "0.65",
            "vPIS": "2.63"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "404.40",
            "pCOFINS": "3.00",
            "vCOFINS": "12.13"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "7898960689266",
        "cEAN": "7898960689266",
        "xProd": "SAXON - ROCK THE NATIONS - 7898960689266",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "PECA",
        "qCom": "10.0000",
        "vUnCom": "33.70",
        "vProd": "337.00",
        "cEANTrib": "7898960689266",
        "uTrib": "PECA",
        "qTrib": "10.0000",
        "vUnTrib": "33.70",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -"
      },
      "imposto": {
        "vTotTrib": "115.49",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "337.00",
            "pPIS": "0.65",
            "vPIS": "2.19"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "337.00",
            "pCOFINS": "3.00",
            "vCOFINS": "10.11"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "7898960689259",
        "cEAN": "7898960689259",
        "xProd": "SAXON - THE EAGLE HAS LANDED (LIVE) - 7898960689259",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "PECA",
        "qCom": "9.0000",
        "vUnCom": "33.70",
        "vProd": "303.30",
        "cEANTrib": "7898960689259",
        "uTrib": "PECA",
        "qTrib": "9.0000",
        "vUnTrib": "33.70",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -"
      },
      "imposto": {
        "vTotTrib": "103.94",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "303.30",
            "pPIS": "0.65",
            "vPIS": "1.97"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "303.30",
            "pCOFINS": "3.00",
            "vCOFINS": "9.10"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "1686181152",
        "cEAN": "0016861811525",
        "xProd": "SLIPKNOT - 9.0 LIVE - 0016861811525",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "Peca",
        "qCom": "1.0000",
        "vUnCom": "24.71",
        "vProd": "24.71",
        "cEANTrib": "0016861811525",
        "uTrib": "Peca",
        "qTrib": "1.0000",
        "vUnTrib": "24.71",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -"
      },
      "imposto": {
        "vTotTrib": "8.47",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "24.71",
            "pPIS": "0.65",
            "vPIS": "0.16"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "24.71",
            "pCOFINS": "3.00",
            "vCOFINS": "0.74"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "1686176372",
        "cEAN": "0016861763725",
        "xProd": "SLIPKNOT - ANTENNAS TO HELL - 1686176372",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "Peca",
        "qCom": "1.0000",
        "vUnCom": "25.84",
        "vProd": "25.84",
        "cEANTrib": "0016861763725",
        "uTrib": "Peca",
        "qTrib": "1.0000",
        "vUnTrib": "25.84",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -"
      },
      "imposto": {
        "vTotTrib": "8.86",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "25.84",
            "pPIS": "0.65",
            "vPIS": "0.17"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "25.84",
            "pCOFINS": "3.00",
            "vCOFINS": "0.78"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "0075678637803",
        "cEAN": "0075678637803",
        "xProd": "SLIPKNOT - THE END, SO FAR - 0075678637803",
        "NCM": "85234910",
        "CEST": "2806300",
        "CFOP": "5102",
        "uCom": "Peca",
        "qCom": "1.0000",
        "vUnCom": "25.84",
        "vProd": "25.84",
        "cEANTrib": "0075678637803",
        "uTrib": "Peca",
        "qTrib": "1.0000",
        "vUnTrib": "25.84",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -"
      },
      "imposto": {
        "vTotTrib": "8.86",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "25.84",
            "pPIS": "0.65",
            "vPIS": "0.17"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "25.84",
            "pCOFINS": "3.00",
            "vCOFINS": "0.78"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "0016861741020",
        "cEAN": "0016861741020",
        "xProd": "SLIPKNOT - WE ARE NOT YOUR KIND - 0016861741020",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "Peca",
        "qCom": "1.0000",
        "vUnCom": "25.84",
        "vProd": "25.84",
        "cEANTrib": "0016861741020",
        "uTrib": "Peca",
        "qTrib": "1.0000",
        "vUnTrib": "25.84",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -"
      },
      "imposto": {
        "vTotTrib": "8.86",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "25.84",
            "pPIS": "0.65",
            "vPIS": "0.17"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "25.84",
            "pCOFINS": "3.00",
            "vCOFINS": "0.78"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "0603497851539",
        "cEAN": "0603497851539",
        "xProd": "STONE TEMPLE PILOTS - PURPLE (REMASTER) - 0603497851539",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "Peca",
        "qCom": "1.0000",
        "vUnCom": "5.00",
        "vProd": "5.00",
        "cEANTrib": "0603497851539",
        "uTrib": "Peca",
        "qTrib": "1.0000",
        "vUnTrib": "5.00",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -"
      },
      "imposto": {
        "vTotTrib": "1.71",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "5.00",
            "pPIS": "0.65",
            "vPIS": "0.03"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "5.00",
            "pCOFINS": "3.00",
            "vCOFINS": "0.15"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "0075678264528",
        "cEAN": "0075678264528",
        "xProd": "TESTAMENT - LOW - 0075678264528",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "PECA",
        "qCom": "1.0000",
        "vUnCom": "25.84",
        "vProd": "25.84",
        "cEANTrib": "0075678264528",
        "uTrib": "PECA",
        "qTrib": "1.0000",
        "vUnTrib": "25.84",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -"
      },
      "imposto": {
        "vTotTrib": "8.86",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "25.84",
            "pPIS": "0.65",
            "vPIS": "0.17"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "25.84",
            "pCOFINS": "3.00",
            "vCOFINS": "0.78"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "5051011758027",
        "cEAN": "5051011758027",
        "xProd": "THE SISTERS OF MERCY - FLOODLAND - 5051011758027",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "PECA",
        "qCom": "21.0000",
        "vUnCom": "24.71",
        "vProd": "518.91",
        "cEANTrib": "5051011758027",
        "uTrib": "PECA",
        "qTrib": "21.0000",
        "vUnTrib": "24.71",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -",
        "rastro": {
          "nLote": "AA",
          "qLote": "21.000",
          "dFab": "2026-02-06",
          "dVal": "2026-05-06"
        }
      },
      "imposto": {
        "vTotTrib": "177.83",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "518.91",
            "pPIS": "0.65",
            "vPIS": "3.37"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "518.91",
            "pCOFINS": "3.00",
            "vCOFINS": "15.57"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "0075678669224",
        "cEAN": "0075678669224",
        "xProd": "TWENTY ONE PILOTS - BLURRYFACE - 0075678669224",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "Peca",
        "qCom": "6.0000",
        "vUnCom": "25.84",
        "vProd": "155.04",
        "cEANTrib": "0075678669224",
        "uTrib": "Peca",
        "qTrib": "6.0000",
        "vUnTrib": "25.84",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -"
      },
      "imposto": {
        "vTotTrib": "53.13",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "155.04",
            "pPIS": "0.65",
            "vPIS": "1.01"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "155.04",
            "pCOFINS": "3.00",
            "vCOFINS": "4.65"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "0075678594687",
        "cEAN": "0075678594687",
        "xProd": "TWENTY ONE PILOTS - BREACH -0075678594687",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "PECA",
        "qCom": "10.0000",
        "vUnCom": "25.84",
        "vProd": "258.40",
        "cEANTrib": "0075678594687",
        "uTrib": "PECA",
        "qTrib": "10.0000",
        "vUnTrib": "25.84",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -"
      },
      "imposto": {
        "vTotTrib": "88.55",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "258.40",
            "pPIS": "0.65",
            "vPIS": "1.68"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "258.40",
            "pCOFINS": "3.00",
            "vCOFINS": "7.75"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "0075678625367",
        "cEAN": "0075678625367",
        "xProd": "TWENTY ONE PILOTS - MTV UNPLUGGED - 0075678625367",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "PECA",
        "qCom": "3.0000",
        "vUnCom": "25.84",
        "vProd": "77.52",
        "cEANTrib": "0075678625367",
        "uTrib": "PECA",
        "qTrib": "3.0000",
        "vUnTrib": "25.84",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -"
      },
      "imposto": {
        "vTotTrib": "26.57",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "77.52",
            "pPIS": "0.65",
            "vPIS": "0.50"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "77.52",
            "pCOFINS": "3.00",
            "vCOFINS": "2.33"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "0075678655265",
        "cEAN": "0075678655265",
        "xProd": "TWENTY ONE PILOTS - TRENCH - 0075678655265",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "Peca",
        "qCom": "9.0000",
        "vUnCom": "25.84",
        "vProd": "232.56",
        "cEANTrib": "0075678655265",
        "uTrib": "Peca",
        "qTrib": "9.0000",
        "vUnTrib": "25.84",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -"
      },
      "imposto": {
        "vTotTrib": "79.70",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "232.56",
            "pPIS": "0.65",
            "vPIS": "1.51"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "232.56",
            "pCOFINS": "3.00",
            "vCOFINS": "6.98"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "0075678007422",
        "cEAN": "0075678007422",
        "xProd": "TWISTED SISTER - YOU CANT STOP ROCK N ROLL - 0075678007422",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "PECA",
        "qCom": "10.0000",
        "vUnCom": "25.84",
        "vProd": "258.40",
        "cEANTrib": "0075678007422",
        "uTrib": "PECA",
        "qTrib": "10.0000",
        "vUnTrib": "25.84",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -",
        "rastro": {
          "nLote": "AA",
          "qLote": "10.000",
          "dFab": "2026-02-06",
          "dVal": "2026-02-06"
        }
      },
      "imposto": {
        "vTotTrib": "88.55",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "258.40",
            "pPIS": "0.65",
            "vPIS": "1.68"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "258.40",
            "pCOFINS": "3.00",
            "vCOFINS": "7.75"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "7898960689303",
        "cEAN": "7898960689303",
        "xProd": "URIAH HEEP - SALISBURY -  7898960689303",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "PECA",
        "qCom": "30.0000",
        "vUnCom": "33.70",
        "vProd": "1011.00",
        "cEANTrib": "7898960689303",
        "uTrib": "PECA",
        "qTrib": "30.0000",
        "vUnTrib": "33.70",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -",
        "rastro": {
          "nLote": "AA",
          "qLote": "30.000",
          "dFab": "2026-02-06",
          "dVal": "2026-05-06"
        }
      },
      "imposto": {
        "vTotTrib": "346.47",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "1011.00",
            "pPIS": "0.65",
            "vPIS": "6.57"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "1011.00",
            "pCOFINS": "3.00",
            "vCOFINS": "30.33"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "0081227954994",
        "cEAN": "0081227954994",
        "xProd": "VAN HALEN - DIVER DOWN - 0081227954994",
        "NCM": "85234910",
        "CEST": "2806300",
        "CFOP": "5102",
        "uCom": "Peca",
        "qCom": "1.0000",
        "vUnCom": "24.71",
        "vProd": "24.71",
        "cEANTrib": "0081227954994",
        "uTrib": "Peca",
        "qTrib": "1.0000",
        "vUnTrib": "24.71",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -"
      },
      "imposto": {
        "vTotTrib": "8.47",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "24.71",
            "pPIS": "0.65",
            "vPIS": "0.16"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "24.71",
            "pCOFINS": "3.00",
            "vCOFINS": "0.74"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "7898960689235",
        "cEAN": "7898960689235",
        "xProd": "VOIVOD - DIMENSION HATROSS - 7898960689235",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "PECA",
        "qCom": "5.0000",
        "vUnCom": "33.70",
        "vProd": "168.50",
        "cEANTrib": "7898960689235",
        "uTrib": "PECA",
        "qTrib": "5.0000",
        "vUnTrib": "33.70",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -"
      },
      "imposto": {
        "vTotTrib": "57.74",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "168.50",
            "pPIS": "0.65",
            "vPIS": "1.10"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "168.50",
            "pCOFINS": "3.00",
            "vCOFINS": "5.06"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "7898960689211",
        "cEAN": "7898960689211",
        "xProd": "VOIVOD - KILLING TECHNOLOGY  - 7898960689211",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "PECA",
        "qCom": "2.0000",
        "vUnCom": "33.70",
        "vProd": "67.40",
        "cEANTrib": "7898960689211",
        "uTrib": "PECA",
        "qTrib": "2.0000",
        "vUnTrib": "33.70",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -"
      },
      "imposto": {
        "vTotTrib": "23.10",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "67.40",
            "pPIS": "0.65",
            "vPIS": "0.44"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "67.40",
            "pCOFINS": "3.00",
            "vCOFINS": "2.02"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "7898960689228",
        "cEAN": "7898960689228",
        "xProd": "VOIVOD - RRROOOAAARRR - 7898960689228",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "PECA",
        "qCom": "2.0000",
        "vUnCom": "33.70",
        "vProd": "67.40",
        "cEANTrib": "7898960689228",
        "uTrib": "PECA",
        "qTrib": "2.0000",
        "vUnTrib": "33.70",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -"
      },
      "imposto": {
        "vTotTrib": "23.10",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "67.40",
            "pPIS": "0.65",
            "vPIS": "0.44"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "67.40",
            "pCOFINS": "3.00",
            "vCOFINS": "2.02"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "0016861971823",
        "cEAN": "0016861971823",
        "xProd": "WHIPLASH - POWER AND PAIN - 0016861971823",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "PECA",
        "qCom": "1.0000",
        "vUnCom": "25.84",
        "vProd": "25.84",
        "cEANTrib": "0016861971823",
        "uTrib": "PECA",
        "qTrib": "1.0000",
        "vUnTrib": "25.84",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -"
      },
      "imposto": {
        "vTotTrib": "8.86",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "25.84",
            "pPIS": "0.65",
            "vPIS": "0.17"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "25.84",
            "pCOFINS": "3.00",
            "vCOFINS": "0.78"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "0094638196129",
        "cEAN": "0094638196129",
        "xProd": "WHITESNAKE - SAINTS AND SINNERS - 0094638196129",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "PECA",
        "qCom": "6.0000",
        "vUnCom": "20.22",
        "vProd": "121.32",
        "cEANTrib": "0094638196129",
        "uTrib": "PECA",
        "qTrib": "6.0000",
        "vUnTrib": "20.22",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -"
      },
      "imposto": {
        "vTotTrib": "41.58",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "121.32",
            "pPIS": "0.65",
            "vPIS": "0.79"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "121.32",
            "pCOFINS": "3.00",
            "vCOFINS": "3.64"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "0190295507527",
        "cEAN": "0190295507527",
        "xProd": "WHITESNAKE - SLIDE IT IN (2019 REMASTER ) - 0190295507527",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "PECA",
        "qCom": "2.0000",
        "vUnCom": "24.71",
        "vProd": "49.42",
        "cEANTrib": "0190295507527",
        "uTrib": "PECA",
        "qTrib": "2.0000",
        "vUnTrib": "24.71",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -"
      },
      "imposto": {
        "vTotTrib": "16.94",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "49.42",
            "pPIS": "0.65",
            "vPIS": "0.32"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "49.42",
            "pCOFINS": "3.00",
            "vCOFINS": "1.48"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "0190295409807",
        "cEAN": "0190295409807",
        "xProd": "WHITESNAKE - SLIP OF THE TONGUE (30th Anniversary Edition)  - 0190295409807",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "Peca",
        "qCom": "1.0000",
        "vUnCom": "24.71",
        "vProd": "24.71",
        "cEANTrib": "0190295409807",
        "uTrib": "Peca",
        "qTrib": "1.0000",
        "vUnTrib": "24.71",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -"
      },
      "imposto": {
        "vTotTrib": "8.47",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "24.71",
            "pPIS": "0.65",
            "vPIS": "0.16"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "24.71",
            "pCOFINS": "3.00",
            "vCOFINS": "0.74"
          }
        }
      }
    },
    {
      "prod": {
        "cProd": "0075678210327",
        "cEAN": "0075678210327",
        "xProd": "WINGER - IN THE HEART OF THE YOUNG - 0075678210327",
        "NCM": "85234910",
        "CFOP": "5102",
        "uCom": "PECA",
        "qCom": "1.0000",
        "vUnCom": "20.22",
        "vProd": "20.22",
        "cEANTrib": "0075678210327",
        "uTrib": "PECA",
        "qTrib": "1.0000",
        "vUnTrib": "20.22",
        "indTot": "1",
        "xPed": "Ped 193 / 229 -"
      },
      "imposto": {
        "vTotTrib": "6.93",
        "ICMS": {
          "ICMSSN101": {
            "orig": "0",
            "CSOSN": "101",
            "pCredSN": "0.00",
            "vCredICMSSN": "0.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "20.22",
            "pPIS": "0.65",
            "vPIS": "0.13"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "20.22",
            "pCOFINS": "3.00",
            "vCOFINS": "0.61"
          }
        }
      }
    }
  ],
  "natOp": "VENDA DE MERCADORIA",
  "xml": {
    "nfeProc": {
      "NFe": {
        "infNFe": {
          "ide": {
            "cUF": "35",
            "cNF": "55425807",
            "natOp": "VENDA DE MERCADORIA",
            "mod": "55",
            "serie": "3",
            "nNF": "5121",
            "dhEmi": "2026-03-07T19:07:10-03:00",
            "dhSaiEnt": "2026-03-07T19:07:59-03:00",
            "tpNF": "1",
            "idDest": "1",
            "cMunFG": "3550308",
            "tpImp": "1",
            "tpEmis": "1",
            "cDV": "8",
            "tpAmb": "1",
            "finNFe": "1",
            "indFinal": "0",
            "indPres": "9",
            "indIntermed": "0",
            "procEmi": "0",
            "verProc": "Tiny ERP"
          },
          "emit": {
            "CNPJ": "33268082000109",
            "xNome": "OPORTO BAHIA COMERCIO DE PRODUTOS CULTURAIS LTDA",
            "xFant": "Oporto da Musica",
            "enderEmit": {
              "xLgr": "AV. ENG. HEITOR ANTONIO EIRAS GARCIA",
              "nro": "1010",
              "xBairro": "JARDIM ESMERALDA",
              "cMun": "3550308",
              "xMun": "Sao Paulo",
              "UF": "SP",
              "CEP": "05588001",
              "cPais": "1058",
              "xPais": "Brasil",
              "fone": "11998459273"
            },
            "IE": "123886761110",
            "IM": "6.228.005-8",
            "CNAE": "4649407",
            "CRT": "1"
          },
          "dest": {
            "CNPJ": "63564727000111",
            "xNome": "OPORTO DA MUSICA LTDA",
            "enderDest": {
              "xLgr": "AVENIDA ENG HEITOR ANTONIO EIRAS GARCIA",
              "nro": "1010",
              "xCpl": "SUBSL 1",
              "xBairro": "JARDIM ESMERALDA",
              "cMun": "3550308",
              "xMun": "SAO PAULO",
              "UF": "SP",
              "CEP": "05588001",
              "cPais": "1058",
              "xPais": "Brasil"
            },
            "indIEDest": "1",
            "IE": "156699260111",
            "email": "contato@oportodamusica.com.br"
          },
          "det": [
            {
              "prod": {
                "cProd": "0075678373824",
                "cEAN": "0075678373824",
                "xProd": "RUSH - COUNTERPARTS (2004 REMASTER) - 0075678373824",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "PECA",
                "qCom": "5.0000",
                "vUnCom": "24.71",
                "vProd": "123.55",
                "cEANTrib": "0075678373824",
                "uTrib": "PECA",
                "qTrib": "5.0000",
                "vUnTrib": "24.71",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -"
              },
              "imposto": {
                "vTotTrib": "42.34",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "123.55",
                    "pPIS": "0.65",
                    "vPIS": "0.80"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "123.55",
                    "pCOFINS": "3.00",
                    "vCOFINS": "3.71"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "0040141951076",
                "cEAN": "0040141951076",
                "xProd": "SAXON - CRUSADER - 0040141951076",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "PECA",
                "qCom": "2.0000",
                "vUnCom": "33.70",
                "vProd": "67.40",
                "cEANTrib": "0040141951076",
                "uTrib": "PECA",
                "qTrib": "2.0000",
                "vUnTrib": "33.70",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -"
              },
              "imposto": {
                "vTotTrib": "23.10",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "67.40",
                    "pPIS": "0.65",
                    "vPIS": "0.44"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "67.40",
                    "pCOFINS": "3.00",
                    "vCOFINS": "2.02"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "7898960689273",
                "cEAN": "7898960689273",
                "xProd": "SAXON - INNOCENCE IS NO EXCUSE -7898960689273",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "PECA",
                "qCom": "12.0000",
                "vUnCom": "33.70",
                "vProd": "404.40",
                "cEANTrib": "7898960689273",
                "uTrib": "PECA",
                "qTrib": "12.0000",
                "vUnTrib": "33.70",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -"
              },
              "imposto": {
                "vTotTrib": "138.59",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "404.40",
                    "pPIS": "0.65",
                    "vPIS": "2.63"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "404.40",
                    "pCOFINS": "3.00",
                    "vCOFINS": "12.13"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "7898960689266",
                "cEAN": "7898960689266",
                "xProd": "SAXON - ROCK THE NATIONS - 7898960689266",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "PECA",
                "qCom": "10.0000",
                "vUnCom": "33.70",
                "vProd": "337.00",
                "cEANTrib": "7898960689266",
                "uTrib": "PECA",
                "qTrib": "10.0000",
                "vUnTrib": "33.70",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -"
              },
              "imposto": {
                "vTotTrib": "115.49",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "337.00",
                    "pPIS": "0.65",
                    "vPIS": "2.19"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "337.00",
                    "pCOFINS": "3.00",
                    "vCOFINS": "10.11"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "7898960689259",
                "cEAN": "7898960689259",
                "xProd": "SAXON - THE EAGLE HAS LANDED (LIVE) - 7898960689259",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "PECA",
                "qCom": "9.0000",
                "vUnCom": "33.70",
                "vProd": "303.30",
                "cEANTrib": "7898960689259",
                "uTrib": "PECA",
                "qTrib": "9.0000",
                "vUnTrib": "33.70",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -"
              },
              "imposto": {
                "vTotTrib": "103.94",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "303.30",
                    "pPIS": "0.65",
                    "vPIS": "1.97"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "303.30",
                    "pCOFINS": "3.00",
                    "vCOFINS": "9.10"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "1686181152",
                "cEAN": "0016861811525",
                "xProd": "SLIPKNOT - 9.0 LIVE - 0016861811525",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "Peca",
                "qCom": "1.0000",
                "vUnCom": "24.71",
                "vProd": "24.71",
                "cEANTrib": "0016861811525",
                "uTrib": "Peca",
                "qTrib": "1.0000",
                "vUnTrib": "24.71",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -"
              },
              "imposto": {
                "vTotTrib": "8.47",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "24.71",
                    "pPIS": "0.65",
                    "vPIS": "0.16"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "24.71",
                    "pCOFINS": "3.00",
                    "vCOFINS": "0.74"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "1686176372",
                "cEAN": "0016861763725",
                "xProd": "SLIPKNOT - ANTENNAS TO HELL - 1686176372",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "Peca",
                "qCom": "1.0000",
                "vUnCom": "25.84",
                "vProd": "25.84",
                "cEANTrib": "0016861763725",
                "uTrib": "Peca",
                "qTrib": "1.0000",
                "vUnTrib": "25.84",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -"
              },
              "imposto": {
                "vTotTrib": "8.86",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "25.84",
                    "pPIS": "0.65",
                    "vPIS": "0.17"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "25.84",
                    "pCOFINS": "3.00",
                    "vCOFINS": "0.78"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "0075678637803",
                "cEAN": "0075678637803",
                "xProd": "SLIPKNOT - THE END, SO FAR - 0075678637803",
                "NCM": "85234910",
                "CEST": "2806300",
                "CFOP": "5102",
                "uCom": "Peca",
                "qCom": "1.0000",
                "vUnCom": "25.84",
                "vProd": "25.84",
                "cEANTrib": "0075678637803",
                "uTrib": "Peca",
                "qTrib": "1.0000",
                "vUnTrib": "25.84",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -"
              },
              "imposto": {
                "vTotTrib": "8.86",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "25.84",
                    "pPIS": "0.65",
                    "vPIS": "0.17"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "25.84",
                    "pCOFINS": "3.00",
                    "vCOFINS": "0.78"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "0016861741020",
                "cEAN": "0016861741020",
                "xProd": "SLIPKNOT - WE ARE NOT YOUR KIND - 0016861741020",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "Peca",
                "qCom": "1.0000",
                "vUnCom": "25.84",
                "vProd": "25.84",
                "cEANTrib": "0016861741020",
                "uTrib": "Peca",
                "qTrib": "1.0000",
                "vUnTrib": "25.84",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -"
              },
              "imposto": {
                "vTotTrib": "8.86",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "25.84",
                    "pPIS": "0.65",
                    "vPIS": "0.17"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "25.84",
                    "pCOFINS": "3.00",
                    "vCOFINS": "0.78"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "0603497851539",
                "cEAN": "0603497851539",
                "xProd": "STONE TEMPLE PILOTS - PURPLE (REMASTER) - 0603497851539",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "Peca",
                "qCom": "1.0000",
                "vUnCom": "5.00",
                "vProd": "5.00",
                "cEANTrib": "0603497851539",
                "uTrib": "Peca",
                "qTrib": "1.0000",
                "vUnTrib": "5.00",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -"
              },
              "imposto": {
                "vTotTrib": "1.71",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "5.00",
                    "pPIS": "0.65",
                    "vPIS": "0.03"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "5.00",
                    "pCOFINS": "3.00",
                    "vCOFINS": "0.15"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "0075678264528",
                "cEAN": "0075678264528",
                "xProd": "TESTAMENT - LOW - 0075678264528",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "PECA",
                "qCom": "1.0000",
                "vUnCom": "25.84",
                "vProd": "25.84",
                "cEANTrib": "0075678264528",
                "uTrib": "PECA",
                "qTrib": "1.0000",
                "vUnTrib": "25.84",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -"
              },
              "imposto": {
                "vTotTrib": "8.86",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "25.84",
                    "pPIS": "0.65",
                    "vPIS": "0.17"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "25.84",
                    "pCOFINS": "3.00",
                    "vCOFINS": "0.78"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "5051011758027",
                "cEAN": "5051011758027",
                "xProd": "THE SISTERS OF MERCY - FLOODLAND - 5051011758027",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "PECA",
                "qCom": "21.0000",
                "vUnCom": "24.71",
                "vProd": "518.91",
                "cEANTrib": "5051011758027",
                "uTrib": "PECA",
                "qTrib": "21.0000",
                "vUnTrib": "24.71",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -",
                "rastro": {
                  "nLote": "AA",
                  "qLote": "21.000",
                  "dFab": "2026-02-06",
                  "dVal": "2026-05-06"
                }
              },
              "imposto": {
                "vTotTrib": "177.83",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "518.91",
                    "pPIS": "0.65",
                    "vPIS": "3.37"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "518.91",
                    "pCOFINS": "3.00",
                    "vCOFINS": "15.57"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "0075678669224",
                "cEAN": "0075678669224",
                "xProd": "TWENTY ONE PILOTS - BLURRYFACE - 0075678669224",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "Peca",
                "qCom": "6.0000",
                "vUnCom": "25.84",
                "vProd": "155.04",
                "cEANTrib": "0075678669224",
                "uTrib": "Peca",
                "qTrib": "6.0000",
                "vUnTrib": "25.84",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -"
              },
              "imposto": {
                "vTotTrib": "53.13",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "155.04",
                    "pPIS": "0.65",
                    "vPIS": "1.01"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "155.04",
                    "pCOFINS": "3.00",
                    "vCOFINS": "4.65"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "0075678594687",
                "cEAN": "0075678594687",
                "xProd": "TWENTY ONE PILOTS - BREACH -0075678594687",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "PECA",
                "qCom": "10.0000",
                "vUnCom": "25.84",
                "vProd": "258.40",
                "cEANTrib": "0075678594687",
                "uTrib": "PECA",
                "qTrib": "10.0000",
                "vUnTrib": "25.84",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -"
              },
              "imposto": {
                "vTotTrib": "88.55",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "258.40",
                    "pPIS": "0.65",
                    "vPIS": "1.68"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "258.40",
                    "pCOFINS": "3.00",
                    "vCOFINS": "7.75"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "0075678625367",
                "cEAN": "0075678625367",
                "xProd": "TWENTY ONE PILOTS - MTV UNPLUGGED - 0075678625367",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "PECA",
                "qCom": "3.0000",
                "vUnCom": "25.84",
                "vProd": "77.52",
                "cEANTrib": "0075678625367",
                "uTrib": "PECA",
                "qTrib": "3.0000",
                "vUnTrib": "25.84",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -"
              },
              "imposto": {
                "vTotTrib": "26.57",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "77.52",
                    "pPIS": "0.65",
                    "vPIS": "0.50"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "77.52",
                    "pCOFINS": "3.00",
                    "vCOFINS": "2.33"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "0075678655265",
                "cEAN": "0075678655265",
                "xProd": "TWENTY ONE PILOTS - TRENCH - 0075678655265",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "Peca",
                "qCom": "9.0000",
                "vUnCom": "25.84",
                "vProd": "232.56",
                "cEANTrib": "0075678655265",
                "uTrib": "Peca",
                "qTrib": "9.0000",
                "vUnTrib": "25.84",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -"
              },
              "imposto": {
                "vTotTrib": "79.70",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "232.56",
                    "pPIS": "0.65",
                    "vPIS": "1.51"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "232.56",
                    "pCOFINS": "3.00",
                    "vCOFINS": "6.98"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "0075678007422",
                "cEAN": "0075678007422",
                "xProd": "TWISTED SISTER - YOU CANT STOP ROCK N ROLL - 0075678007422",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "PECA",
                "qCom": "10.0000",
                "vUnCom": "25.84",
                "vProd": "258.40",
                "cEANTrib": "0075678007422",
                "uTrib": "PECA",
                "qTrib": "10.0000",
                "vUnTrib": "25.84",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -",
                "rastro": {
                  "nLote": "AA",
                  "qLote": "10.000",
                  "dFab": "2026-02-06",
                  "dVal": "2026-02-06"
                }
              },
              "imposto": {
                "vTotTrib": "88.55",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "258.40",
                    "pPIS": "0.65",
                    "vPIS": "1.68"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "258.40",
                    "pCOFINS": "3.00",
                    "vCOFINS": "7.75"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "7898960689303",
                "cEAN": "7898960689303",
                "xProd": "URIAH HEEP - SALISBURY -  7898960689303",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "PECA",
                "qCom": "30.0000",
                "vUnCom": "33.70",
                "vProd": "1011.00",
                "cEANTrib": "7898960689303",
                "uTrib": "PECA",
                "qTrib": "30.0000",
                "vUnTrib": "33.70",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -",
                "rastro": {
                  "nLote": "AA",
                  "qLote": "30.000",
                  "dFab": "2026-02-06",
                  "dVal": "2026-05-06"
                }
              },
              "imposto": {
                "vTotTrib": "346.47",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "1011.00",
                    "pPIS": "0.65",
                    "vPIS": "6.57"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "1011.00",
                    "pCOFINS": "3.00",
                    "vCOFINS": "30.33"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "0081227954994",
                "cEAN": "0081227954994",
                "xProd": "VAN HALEN - DIVER DOWN - 0081227954994",
                "NCM": "85234910",
                "CEST": "2806300",
                "CFOP": "5102",
                "uCom": "Peca",
                "qCom": "1.0000",
                "vUnCom": "24.71",
                "vProd": "24.71",
                "cEANTrib": "0081227954994",
                "uTrib": "Peca",
                "qTrib": "1.0000",
                "vUnTrib": "24.71",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -"
              },
              "imposto": {
                "vTotTrib": "8.47",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "24.71",
                    "pPIS": "0.65",
                    "vPIS": "0.16"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "24.71",
                    "pCOFINS": "3.00",
                    "vCOFINS": "0.74"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "7898960689235",
                "cEAN": "7898960689235",
                "xProd": "VOIVOD - DIMENSION HATROSS - 7898960689235",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "PECA",
                "qCom": "5.0000",
                "vUnCom": "33.70",
                "vProd": "168.50",
                "cEANTrib": "7898960689235",
                "uTrib": "PECA",
                "qTrib": "5.0000",
                "vUnTrib": "33.70",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -"
              },
              "imposto": {
                "vTotTrib": "57.74",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "168.50",
                    "pPIS": "0.65",
                    "vPIS": "1.10"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "168.50",
                    "pCOFINS": "3.00",
                    "vCOFINS": "5.06"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "7898960689211",
                "cEAN": "7898960689211",
                "xProd": "VOIVOD - KILLING TECHNOLOGY  - 7898960689211",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "PECA",
                "qCom": "2.0000",
                "vUnCom": "33.70",
                "vProd": "67.40",
                "cEANTrib": "7898960689211",
                "uTrib": "PECA",
                "qTrib": "2.0000",
                "vUnTrib": "33.70",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -"
              },
              "imposto": {
                "vTotTrib": "23.10",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "67.40",
                    "pPIS": "0.65",
                    "vPIS": "0.44"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "67.40",
                    "pCOFINS": "3.00",
                    "vCOFINS": "2.02"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "7898960689228",
                "cEAN": "7898960689228",
                "xProd": "VOIVOD - RRROOOAAARRR - 7898960689228",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "PECA",
                "qCom": "2.0000",
                "vUnCom": "33.70",
                "vProd": "67.40",
                "cEANTrib": "7898960689228",
                "uTrib": "PECA",
                "qTrib": "2.0000",
                "vUnTrib": "33.70",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -"
              },
              "imposto": {
                "vTotTrib": "23.10",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "67.40",
                    "pPIS": "0.65",
                    "vPIS": "0.44"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "67.40",
                    "pCOFINS": "3.00",
                    "vCOFINS": "2.02"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "0016861971823",
                "cEAN": "0016861971823",
                "xProd": "WHIPLASH - POWER AND PAIN - 0016861971823",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "PECA",
                "qCom": "1.0000",
                "vUnCom": "25.84",
                "vProd": "25.84",
                "cEANTrib": "0016861971823",
                "uTrib": "PECA",
                "qTrib": "1.0000",
                "vUnTrib": "25.84",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -"
              },
              "imposto": {
                "vTotTrib": "8.86",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "25.84",
                    "pPIS": "0.65",
                    "vPIS": "0.17"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "25.84",
                    "pCOFINS": "3.00",
                    "vCOFINS": "0.78"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "0094638196129",
                "cEAN": "0094638196129",
                "xProd": "WHITESNAKE - SAINTS AND SINNERS - 0094638196129",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "PECA",
                "qCom": "6.0000",
                "vUnCom": "20.22",
                "vProd": "121.32",
                "cEANTrib": "0094638196129",
                "uTrib": "PECA",
                "qTrib": "6.0000",
                "vUnTrib": "20.22",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -"
              },
              "imposto": {
                "vTotTrib": "41.58",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "121.32",
                    "pPIS": "0.65",
                    "vPIS": "0.79"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "121.32",
                    "pCOFINS": "3.00",
                    "vCOFINS": "3.64"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "0190295507527",
                "cEAN": "0190295507527",
                "xProd": "WHITESNAKE - SLIDE IT IN (2019 REMASTER ) - 0190295507527",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "PECA",
                "qCom": "2.0000",
                "vUnCom": "24.71",
                "vProd": "49.42",
                "cEANTrib": "0190295507527",
                "uTrib": "PECA",
                "qTrib": "2.0000",
                "vUnTrib": "24.71",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -"
              },
              "imposto": {
                "vTotTrib": "16.94",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "49.42",
                    "pPIS": "0.65",
                    "vPIS": "0.32"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "49.42",
                    "pCOFINS": "3.00",
                    "vCOFINS": "1.48"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "0190295409807",
                "cEAN": "0190295409807",
                "xProd": "WHITESNAKE - SLIP OF THE TONGUE (30th Anniversary Edition)  - 0190295409807",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "Peca",
                "qCom": "1.0000",
                "vUnCom": "24.71",
                "vProd": "24.71",
                "cEANTrib": "0190295409807",
                "uTrib": "Peca",
                "qTrib": "1.0000",
                "vUnTrib": "24.71",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -"
              },
              "imposto": {
                "vTotTrib": "8.47",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "24.71",
                    "pPIS": "0.65",
                    "vPIS": "0.16"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "24.71",
                    "pCOFINS": "3.00",
                    "vCOFINS": "0.74"
                  }
                }
              }
            },
            {
              "prod": {
                "cProd": "0075678210327",
                "cEAN": "0075678210327",
                "xProd": "WINGER - IN THE HEART OF THE YOUNG - 0075678210327",
                "NCM": "85234910",
                "CFOP": "5102",
                "uCom": "PECA",
                "qCom": "1.0000",
                "vUnCom": "20.22",
                "vProd": "20.22",
                "cEANTrib": "0075678210327",
                "uTrib": "PECA",
                "qTrib": "1.0000",
                "vUnTrib": "20.22",
                "indTot": "1",
                "xPed": "Ped 193 / 229 -"
              },
              "imposto": {
                "vTotTrib": "6.93",
                "ICMS": {
                  "ICMSSN101": {
                    "orig": "0",
                    "CSOSN": "101",
                    "pCredSN": "0.00",
                    "vCredICMSSN": "0.00"
                  }
                },
                "PIS": {
                  "PISAliq": {
                    "CST": "01",
                    "vBC": "20.22",
                    "pPIS": "0.65",
                    "vPIS": "0.13"
                  }
                },
                "COFINS": {
                  "COFINSAliq": {
                    "CST": "01",
                    "vBC": "20.22",
                    "pCOFINS": "3.00",
                    "vCOFINS": "0.61"
                  }
                }
              }
            }
          ],
          "total": {
            "ICMSTot": {
              "vBC": "0.00",
              "vICMS": "0.00",
              "vICMSDeson": "0.00",
              "vFCPUFDest": "0.00",
              "vICMSUFDest": "0.00",
              "vICMSUFRemet": "0.00",
              "vFCP": "0.00",
              "vBCST": "0.00",
              "vST": "0.00",
              "vFCPST": "0.00",
              "vFCPSTRet": "0.00",
              "vProd": "4450.07",
              "vFrete": "0.00",
              "vSeg": "0.00",
              "vDesc": "0.00",
              "vII": "0.00",
              "vIPI": "0.00",
              "vIPIDevol": "0.00",
              "vPIS": "28.93",
              "vCOFINS": "133.53",
              "vOutro": "0.00",
              "vNF": "4450.07",
              "vTotTrib": "1525.07"
            }
          },
          "transp": {
            "modFrete": "9",
            "vol": {
              "pesoL": "15.877",
              "pesoB": "15.877"
            }
          },
          "pag": {
            "detPag": {
              "tPag": "99",
              "xPag": "Deposito Banco Itau",
              "vPag": "4450.07"
            }
          },
          "infAdic": {
            "infCpl": "Permite o aproveitamento do credito de ICMS no valor de R$ 0,00, Correspondente a aliquota de 0,00% nos termos do Art. 23 da LC 123/2006<br /><br />Tributos aproximados: R$ 724,02 (Federal) e R$ 801,00 (Estadual). Fonte: IBPT 3CA397<br />OC: Ped 193 / 229 -06032026<br />N Pedido: 6104"
},
"compra": {
"xPed": "Ped 193 / 229 -06032026"
},
"infRespTec": {
"CNPJ": "15088992000128",
"xContato": "Fernando",
"email": "integracao@tiny.com.br",
"fone": "05430558200"
}
},
"Signature": {
"SignedInfo": {
"CanonicalizationMethod": "",
"SignatureMethod": "",
"Reference": {
"Transforms": {
"Transform": [
"",
""
]
},
"DigestMethod": "",
"DigestValue": "6ESxL5HLo7Y7hF/ZDrSTSO1xSiE="
}
},
"SignatureValue": "ZaLUsuSSUu/1VSMCcYUfCxNiqmul5jygWcCYhDLeeGvbwmTsX1nBcZA2c9AWAynRIetdFep7R016xWKrDzcW7J5U3wBiUXRtFoM84nwM12PqSqyr61P/lYLx8qHcMM/4F8BNANXRq3ztaLl5OCk6cVX2z7cYBF82SfJpjy3bYnN1h4MOLVISiJAQYa+Sq1xGu/rsknfsqnBfwmQsizwe+CH0PF8qpmo1ejX/uuP5VlCCEBOs/3WYvzn8MGsVZs+GUbvirnnDUVmD4Yy14YfAN0IFmV0F6PSdAGIgALhaKay0zr9/eLItD89WVSvjR5pZ2VYbsPjKFHl0rZLp3x4MPw==",
"KeyInfo": {
"X509Data": {
"X509Certificate": "MIIIGjCCBgKgAwIBAgIQObQPFzPni0T6PSO69tCObDANBgkqhkiG9w0BAQsFADB4MQswCQYDVQQGEwJCUjETMBEGA1UEChMKSUNQLUJyYXNpbDE2MDQGA1UECxMtU2VjcmV0YXJpYSBkYSBSZWNlaXRhIEZlZGVyYWwgZG8gQnJhc2lsIC0gUkZCMRwwGgYDVQQDExNBQyBDZXJ0aXNpZ24gUkZCIEc1MB4XDTI2MDIyMDE5MTMxNloXDTI3MDIyMDE5MTMxNlowggELMQswCQYDVQQGEwJCUjETMBEGA1UECgwKSUNQLUJyYXNpbDELMAkGA1UECAwCU1AxEjAQBgNVBAcMCVNhbyBQYXVsbzETMBEGA1UECwwKUHJlc2VuY2lhbDEXMBUGA1UECwwONjA1MjQ1NTAwMDAxMzExNjA0BgNVBAsMLVNlY3JldGFyaWEgZGEgUmVjZWl0YSBGZWRlcmFsIGRvIEJyYXNpbCAtIFJGQjEWMBQGA1UECwwNUkZCIGUtQ05QSiBBMTFIMEYGA1UEAww/T1BPUlRPIEJBSElBIENPTUVSQ0lPIERFIFBST0RVVE9TIENVTFRVUkFJUyBMVERBOjMzMjY4MDgyMDAwMTA5MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlPxm4KB3RgL50zPRq/Uo2pdV5wVivaxomAmISfYc5MUJtqXkmC+xmsvkwYbcqcvMLhV9aXbrW/Wpsz9s8yybWWZGae1dPohIyVFYalM4V7yRRylNgI0FIeWXLU6MJLysYoFWjWdwSZr8ZkEjmNP0YQoxgxbrkyrCzjfSnhslQYp0ZA+g3EwWf7/My+4JpBiMBdboIknzM2XdpCWRUZXlqIueYOu/ldYxkKsYMDZse6IZhQYPXBF77NIyqfdI/1qjCm4IVhVEJxjet6Y2eiZtFzFwXsuyS+aPkUpaKwn3CyyAy8InKA28H7fBcSYdixuxAZZOfe9gRD5ZbYJt1s8VwQIDAQABo4IDCTCCAwUwgbgGA1UdEQSBsDCBraA4BgVgTAEDBKAvBC0xMjA0MTk1OTAxMjM5OTcxODY5MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDCgJQYFYEwBAwKgHAQaRUxJWkFCRVRFIFpBRkFMT04gRkVSUkVJUkGgGQYFYEwBAwOgEAQOMzMyNjgwODIwMDAxMDmgFwYFYEwBAwegDgQMMDAwMDAwMDAwMDAwgRZiZXRlemFmYWxvbjdAZ21haWwuY29tMAkGA1UdEwQCMAAwHwYDVR0jBBgwFoAUU31/nb7RYdAgutqf44mnE3NYzUIwfwYDVR0gBHgwdjB0BgZgTAECAQwwajBoBggrBgEFBQcCARZcaHR0cDovL2ljcC1icmFzaWwuY2VydGlzaWduLmNvbS5ici9yZXBvc2l0b3Jpby9kcGMvQUNfQ2VydGlzaWduX1JGQi9EUENfQUNfQ2VydGlzaWduX1JGQi5wZGYwgbwGA1UdHwSBtDCBsTBXoFWgU4ZRaHR0cDovL2ljcC1icmFzaWwuY2VydGlzaWduLmNvbS5ici9yZXBvc2l0b3Jpby9sY3IvQUNDZXJ0aXNpZ25SRkJHNS9MYXRlc3RDUkwuY3JsMFagVKBShlBodHRwOi8vaWNwLWJyYXNpbC5vdXRyYWxjci5jb20uYnIvcmVwb3NpdG9yaW8vbGNyL0FDQ2VydGlzaWduUkZCRzUvTGF0ZXN0Q1JMLmNybDAOBgNVHQ8BAf8EBAMCBeAwHQYDVR0lBBYwFAYIKwYBBQUHAwIGCCsGAQUFBwMEMIGsBggrBgEFBQcBAQSBnzCBnDBfBggrBgEFBQcwAoZTaHR0cDovL2ljcC1icmFzaWwuY2VydGlzaWduLmNvbS5ici9yZXBvc2l0b3Jpby9jZXJ0aWZpY2Fkb3MvQUNfQ2VydGlzaWduX1JGQl9HNS5wN2MwOQYIKwYBBQUHMAGGLWh0dHA6Ly9vY3NwLWFjLWNlcnRpc2lnbi1yZmIuY2VydGlzaWduLmNvbS5icjANBgkqhkiG9w0BAQsFAAOCAgEATi1LJiTuwg6SGJyoN9qwWOGGlbQsNu4SfHR22BvbouSKV1DMkdcCyqiVEMPVCmhvfP/zAzRscN0T0htevDvLK+4B+3HMca5U/I2398q6ffHJSfBjKjI3pwXVGP/P6XS0CKONWdgA5wpZNQYupmRGdWnaDYFqRXXZpiQ/XiNDW7KIdDmDfly1Dr/ajdW53aoPU2XJ+ZKy5XbcFpJdJkYk9IuQ1DtAUgfGKmKFBWwLd7VUwRVQRCHfG4g8Ej/7d9CvjBCKi7gTcoPa1/b5AnRoZ7/hwWtrt/QZ5SG/svqjwymOZP61semssg286OHP0lBSUrmM/7z+SlPA4Pq3Nbk2Q2ZjG2tMA0+sKojWishotMxM+Dx6nDTbiDbsv5JwG+mAmFWlmpqkE/yzITcChPnYi0zUt2j6YaArLxUX/OJTyO/NOcen6tiw3ttvyS489kWmdBZIzE9rb5LH0TMDsSAbmL75FEU6qUqL6Cjv25Kl7QLi6GtSrUaP6nbefwtF2wssGZGUjw2hoDy1ARN4zH2+iL+v2mTCKRdhJjnkzuO0Jul0bJgODKa4epZaNLVCMrduoCC07gPproC4B1GT/ICPjKyA7IKznfyka6zUyZYjNqv6IrdFIcsXhZsuZ01iQ8DfEzfokZY3QzlDQgfS7Xo8BvuxsgTMqLJ+Oq5E8BvXf/k="
}
}
}
},
"protNFe": {
"infProt": {
"tpAmb": "1",
"verAplic": "SP_NFE_PL009_V4",
"chNFe": "35260333268082000109550030000051211554258078",
"dhRecbto": "2026-03-07T19:08:13-03:00",
"nProt": "135260883771884",
"digVal": "6ESxL5HLo7Y7hF/ZDrSTSO1xSiE=",
"cStat": "100",
"xMotivo": "Autorizado o uso da NF-e"
}
}
}
},
"id_tenant": 1
}

deve ter opcao para exportar em planilha os dados acima em formato excel (numero, serie, data_emissao ,nome, natOp, valor_produtos, valor_frete , valor , descricao_situacao, chave_acesso
).

deve ter paginacao para exibir os dados em partes, caso haja muitos registros.
deve paginar de 100 em 100 registros por pagina.

deve exibir o total da coluna valor_produtos, valor_frete e valor para a página atual e para o total geral.
deve filtrar os dados por data de emissão ou por numero da nota fiscal.

siga o padrao encontrado em /home/oteniel/projetos/oportobahia/oportobahia-frontend/src/components/produto-royalty/ProdutoRoyaltyTable.tsx como modelo .

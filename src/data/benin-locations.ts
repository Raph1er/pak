// Données géographiques du Bénin
// Départements, communes et arrondissements

export interface Commune {
  nom: string;
  arrondissements: string[];
}

export interface Departement {
  nom: string;
  communes: Commune[];
}

export const beninDepartements: Departement[] = [
  {
    "nom": "Alibori",
    "communes": [
      {
        "nom": "Banikoara",
        "arrondissements": ["Banikoara", "Founougo", "Gomparou", "Goumori", "Kokey", "Kokiborou", "Ounet", "Sompérékou", "Soroko", "Toura"]
      },
      {
        "nom": "Gogounou",
        "arrondissements": ["Bagou", "Gogounou", "Gounarou", "Ouara", "Sori", "Zoungou-Pantrossi"]
      },
      {
        "nom": "Kandi",
        "arrondissements": ["Angaradébou", "Bensékou", "Donwari", "Kandi I", "Kandi II", "Kandi III", "Kassakou", "Saah", "Sam", "Sonsoro"]
      },
      {
        "nom": "Karimama",
        "arrondissements": ["Birni Lafia", "Bogo-Bogo", "Karimama", "Kompa", "Monsey"]
      },
      {
        "nom": "Malanville",
        "arrondissements": ["Garou", "Guéné", "Malanville", "Madécali", "Toumboutou"]
      },
      {
        "nom": "Segbana",
        "arrondissements": ["Libantè", "Liboussou", "Lougou", "Segbana", "Sokotindji"]
      }
    ]
  },
  {
    "nom": "Atakora",
    "communes": [
      {
        "nom": "Boukoumbé",
        "arrondissements": ["Boukoumbé", "Dipoli", "Korontière", "Kossoucoingou", "Manta", "Natta", "Tabota"]
      },
      {
        "nom": "Cobly",
        "arrondissements": ["Cobly", "Datori", "Kountori", "Tapoga"]
      },
      {
        "nom": "Kérou",
        "arrondissements": ["Brignamaro", "Firou", "Kérou", "Koabagou"]
      },
      {
        "nom": "Kouandé",
        "arrondissements": ["Birni", "Chabi-Couma", "Fô-Tancé", "Guilmaro", "Kouandé", "Oroukayo"]
      },
      {
        "nom": "Matéri",
        "arrondissements": ["Dassari", "Gouandé", "Matéri", "Nodi", "Tantéga", "Tchianhoun-Cossi"]
      },
      {
        "nom": "Natitingou",
        "arrondissements": ["Kotopounga", "Kouaba", "Koundata", "Natitingou I", "Natitingou II", "Natitingou III", "Natitingou IV", "Perma", "Tchoumi-Tchoumi"]
      },
      {
        "nom": "Péhunco",
        "arrondissements": ["Gnémasson", "Péhunco", "Tobré"]
      },
      {
        "nom": "Tanguiéta",
        "arrondissements": ["Cotiakou", "N'Dahonta", "Taiakou", "Tanguiéta", "Tanongou"]
      },
      {
        "nom": "Toucountouna",
        "arrondissements": ["Kouarfa", "Tampégré", "Toucountouna"]
      }
    ]
  },
  {
    "nom": "Atlantique",
    "communes": [
      {
        "nom": "Abomey-Calavi",
        "arrondissements": ["Abomey-Calavi", "Akassato", "Godomey", "Glo-Djigbé", "Hêvié", "Kpanroun", "Ouèdo", "Togba", "Zinvié"]
      },
      {
        "nom": "Allada",
        "arrondissements": ["Agbanou", "Ahouannonzoun", "Allada", "Attogon", "Avakpa", "Ayou", "Hinvi", "Lissègazoun", "Lon-Agonmey", "Sekou", "Togoudo", "Tokpa-Avagoudo"]
      },
      {
        "nom": "Kpomassè",
        "arrondissements": ["Aganmalomè", "Agbanto", "Agonkanmè", "Dédomè", "Dékanmè", "Kpomassè", "Sègbèya", "Sègbohouè", "Tokpa-Domè"]
      },
      {
        "nom": "Ouidah",
        "arrondissements": ["Avlékété", "Djègbadji", "Gakpé", "Houakpè-Daho", "Ouidah I", "Ouidah II", "Ouidah III", "Ouidah IV", "Pahou", "Savi"]
      },
      {
        "nom": "Sô-Ava",
        "arrondissements": ["Ahomey-Lokpo", "Dékanmey", "Ganvié I", "Ganvié II", "Houédo-Aguékon", "Sô-Ava", "Vekky"]
      },
      {
        "nom": "Toffo",
        "arrondissements": ["Agué", "Colli-Agbamè", "Coussi", "Damè", "Djanglanmè", "Houègbo", "Kpomè", "Sè", "Sèhouè", "Toffo-Agué"]
      },
      {
        "nom": "Tori-Bossito",
        "arrondissements": ["Avamè", "Azohouè-Aliho", "Azohouè-Cada", "Tori-Bossito", "Tori-Cada", "Tori-Gare"]
      },
      {
        "nom": "Zè",
        "arrondissements": ["Adjan", "Dawè", "Djigbé", "Dodji-Bata", "Hèkanmé", "Koundokpoé", "Sèdjè-Dénou", "Sèdjè-Houégoudo", "Tangbo-Djevié", "Yokpo", "Zè"]
      }
    ]
  },
  {
    "nom": "Borgou",
    "communes": [
      {
        "nom": "Bembéréké",
        "arrondissements": ["Bembéréké", "Béroubouay", "Bouanri", "Gamia", "Ina"]
      },
      {
        "nom": "Kalalé",
        "arrondissements": ["Basso", "Bouka", "Dérassi", "Dunkassa", "Kalalé", "Péonga"]
      },
      {
        "nom": "N'Dali",
        "arrondissements": ["Bori", "Gbégourou", "N'Dali", "Ouénou", "Sirarou"]
      },
      {
        "nom": "Nikki",
        "arrondissements": ["Biro", "Gnonkourakali", "Nikki", "Ouénou", "Sérékalé", "Suya", "Tasso"]
      },
      {
        "nom": "Parakou",
        "arrondissements": ["1er arrondissement", "2e arrondissement", "3e arrondissement"]
      },
      {
        "nom": "Pèrèrè",
        "arrondissements": ["Gninsy", "Guinagourou", "Kpané", "Pébié", "Pèrèrè", "Sontou"]
      },
      {
        "nom": "Sinendé",
        "arrondissements": ["Fô-Bourè", "Sèkèrè", "Sikki", "Sinendé"]
      },
      {
        "nom": "Tchaourou",
        "arrondissements": ["Alafiarou", "Bétérou", "Goro", "Kika", "Sanson", "Tchaourou", "Tchatchou"]
      }
    ]
  },
  {
    "nom": "Collines",
    "communes": [
      {
        "nom": "Bantè",
        "arrondissements": ["Agoua", "Akpassi", "Atokoligbé", "Bantè", "Bobè", "Gouka", "Koko", "Lougba", "Pira"]
      },
      {
        "nom": "Dassa-Zoumè",
        "arrondissements": ["Akofodjoulè", "Dassa I", "Dassa II", "Gbaffo", "Kerè", "Kpingni", "Lèma", "Paouignan", "Soclogbo", "Tré"]
      },
      {
        "nom": "Glazoué",
        "arrondissements": ["Aklankpa", "Assanté", "Glazoué", "Gomè", "Kpakpaza", "Magoumi", "Ouèdèmè", "Sokponta", "Thio", "Zaffé"]
      },
      {
        "nom": "Ouèssè",
        "arrondissements": ["Challa-Ogoi", "Djègbè", "Gbanlin", "Kémon", "Kilibo", "Laminou", "Odougba", "Ouèssè", "Toui"]
      },
      {
        "nom": "Savalou",
        "arrondissements": ["Djaloukou", "Doumè", "Gobada", "Kpataba", "Lahotan", "Lèma", "Logozohè", "Monkpa", "Ottola", "Ouèssè", "Savalou-aga", "Savalou-agbado", "Savalou-attakè", "Tchetti"]
      },
      {
        "nom": "Savè",
        "arrondissements": ["Adido", "Bèssè", "Boni", "Kaboua", "Ofè", "Okpara", "Plateau", "Sakin"]
      }
    ]
  },
  {
    "nom": "Donga",
    "communes": [
      {
        "nom": "Bassila",
        "arrondissements": ["Alédjo", "Bassila", "Manigri", "Pénéssoulou"]
      },
      {
        "nom": "Copargo",
        "arrondissements": ["Anandana", "Copargo", "Pabégou", "Singré"]
      },
      {
        "nom": "Djougou",
        "arrondissements": ["Barei", "Bariénou", "Bélléfoungou", "Bougou", "Djougou I", "Djougou II", "Djougou III", "Kolokondé", "Onklou", "Patargo", "Pélébina", "Sérou"]
      },
      {
        "nom": "Ouaké",
        "arrondissements": ["Badjoudè", "Kondé", "Ouaké", "Sèmèrè I", "Sèmèrè II", "Tchalinga"]
      }
    ]
  },
  {
    "nom": "Kouffo",
    "communes": [
      {
        "nom": "Aplahoué",
        "arrondissements": ["Aplahoué", "Atomè", "Azovè", "Dekpo", "Godohou", "Kissamey", "Lonkly"]
      },
      {
        "nom": "Djakotomey",
        "arrondissements": ["Adjintimey", "Bètoumey", "Djakotomey I", "Djakotomey II", "Gohomey", "Houègamey", "Kinkinhoué", "Kokohoué", "Kpoba", "Sokouhoué"]
      },
      {
        "nom": "Dogbo-Tota",
        "arrondissements": ["Ayomi", "Dèvè", "Honton", "Lokogohoué", "Madjrè", "Tota", "Totchagni"]
      },
      {
        "nom": "Klouékanmè",
        "arrondissements": ["Adjanhonmè", "Ahogbèya", "Aya-Hohoué", "Djotto", "Hondji", "Klouékanmè", "Lanta", "Tchikpé"]
      },
      {
        "nom": "Lalo",
        "arrondissements": ["Adoukandji", "Ahondjinnako", "Ahomadegbe", "Banigbé", "Gnizounmè", "Hlassamè", "Lalo", "Lokogba", "Tchito", "Tohou", "Zalli"]
      },
      {
        "nom": "Toviklin",
        "arrondissements": ["Adjido", "Avédjin", "Doko", "Houédogli", "Missinko", "Tannou-Gola", "Toviklin"]
      }
    ]
  },
  {
    "nom": "Littoral",
    "communes": [
      {
        "nom": "Cotonou",
        "arrondissements": ["1er arrondissement", "2e arrondissement", "3e arrondissement", "4e arrondissement", "5e arrondissement", "6e arrondissement", "7e arrondissement", "8e arrondissement", "9e arrondissement", "10e arrondissement", "11e arrondissement", "12e arrondissement", "13e arrondissement"]
      }
    ]
  },
  {
    "nom": "Mono",
    "communes": [
      {
        "nom": "Athiémé",
        "arrondissements": ["Adohoun", "Atchannou", "Athiémé", "Dédékpoé", "Kpinnou"]
      },
      {
        "nom": "Bopa",
        "arrondissements": ["Agbodji", "Badazoui", "Bopa", "Gbakpodji", "Lobogo", "Possotomè", "Yégodoé"]
      },
      {
        "nom": "Comè",
        "arrondissements": ["Agatogbo", "Akodéha", "Comè", "Ouèdèmè-Pédah", "Oumako"]
      },
      {
        "nom": "Grand-Popo",
        "arrondissements": ["Adjaha", "Agoué", "Avloh", "Djanglanmey", "Gbéhoué", "Grand-Popo", "Sazoué"]
      },
      {
        "nom": "Houéyogbé",
        "arrondissements": ["Dahé", "Doutou", "Honhoué", "Houéyogbé", "Sè", "Zoungbonou"]
      },
      {
        "nom": "Lokossa",
        "arrondissements": ["Agamé", "Houin", "Koudo", "Lokossa", "Ouèdèmè"]
      }
    ]
  },
  {
    "nom": "Ouémé",
    "communes": [
      {
        "nom": "Adjarra",
        "arrondissements": ["Adjarra I", "Adjarra II", "Aglogbé", "Honvié", "Malanhoui", "Médédjonou"]
      },
      {
        "nom": "Adjohoun",
        "arrondissements": ["Adjohoun", "Akpadanou", "Awonou", "Azowlissè", "Dèmè", "Gangban", "Kodè", "Togbota"]
      },
      {
        "nom": "Aguégués",
        "arrondissements": ["Avagbodji", "Houédomè", "Zoungamè"]
      },
      {
        "nom": "Akpro-Missérété",
        "arrondissements": ["Akpro-Missérété", "Gomè-Sota", "Katagon", "Vakon", "Zodogbomey"]
      },
      {
        "nom": "Avrankou",
        "arrondissements": ["Atchoukpa", "Avrankou", "Djomon", "Gbozounmè", "Kouty", "Ouanho", "Sado"]
      },
      {
        "nom": "Bonou",
        "arrondissements": ["Affamè", "Atchonsa", "Bonou", "Damè-Wogon", "Houinviguè"]
      },
      {
        "nom": "Dangbo",
        "arrondissements": ["Dangbo", "Dèkin", "Gbéko", "Houédomey", "Hozin", "Késsounou", "Zounguè"]
      },
      {
        "nom": "Porto-Novo",
        "arrondissements": ["1er arrondissement", "2e arrondissement", "3e arrondissement", "4e arrondissement", "5e arrondissement"]
      },
      {
        "nom": "Sèmè-Kpodji",
        "arrondissements": ["Agblangandan", "Aholouyèmè", "Djèrègbè", "Ekpè", "Sèmè-Kpodji", "Tohouè"]
      }
    ]
  },
  {
    "nom": "Plateau",
    "communes": [
      {
        "nom": "Adja-Ouèrè",
        "arrondissements": ["Adja-Ouèrè", "Ikpinlè", "Kpoulou", "Massè", "Oko-Akarè", "Totonnoukon"]
      },
      {
        "nom": "Ifangni",
        "arrondissements": ["Banigbé", "Daagbé", "Ifangni", "Ko-Koumolou", "Lagbé", "Tchaada"]
      },
      {
        "nom": "Kétou",
        "arrondissements": ["Adakplamé", "Idigny", "Kpankou", "Kétou", "Odometa", "Okpometa"]
      },
      {
        "nom": "Pobè",
        "arrondissements": ["Ahoyéyé", "Igana", "Issaba", "Pobè", "Towé"]
      },
      {
        "nom": "Sakété",
        "arrondissements": ["Aguidi", "Ita-Djèbou", "Sakété I", "Sakété II", "Takon", "Yoko"]
      }
    ]
  },
  {
    "nom": "Zou",
    "communes": [
      {
        "nom": "Abomey",
        "arrondissements": ["Agbokpa", "Dètohou", "Djègbè", "Hounli", "Sèhoun", "Vidolè", "Zounzounmè"]
      },
      {
        "nom": "Agbangnizoun",
        "arrondissements": ["Adahondjigon", "Adingningon", "Agbangnizoun", "Kinta", "Kpota", "Lissazounmè", "Sahé", "Siwé", "Tanvé", "Zoungoudo"]
      },
      {
        "nom": "Bohicon",
        "arrondissements": ["Agongointo", "Avogbana", "Bohicon I", "Bohicon II", "Gnidjazoun", "Lissèzoun", "Ouassaho", "Passagon", "Saclo", "Sodohomè"]
      },
      {
        "nom": "Covè",
        "arrondissements": ["Adogbé", "Gounli", "Houéko", "Houen-Hounso", "Lainta-Cogbè", "Naogon", "Solè", "Zogba"]
      },
      {
        "nom": "Djidja",
        "arrondissements": ["Djidja", "Dohouimè", "Gohoun", "Onigbolo", "Ounglègbo", "Sèmè", "Zoukou"]
      },
      {
        "nom": "Ouinhi",
        "arrondissements": ["Dasso", "Ouinhi", "Sagon", "Tohoué"]
      },
      {
        "nom": "Za-Kpota",
        "arrondissements": ["Allahé", "Assalin", "Houngomey", "Kpakpamè", "Kpozoun", "Za-Kpota", "Za-Tanta", "Zèko"]
      },
      {
        "nom": "Zangnanado",
        "arrondissements": ["Agonli-Houégbo", "Banamè", "Djia", "Tanwé-Hessou", "Zangnanado", "Zoungoudo"]
      },
      {
        "nom": "Zogbodomey",
        "arrondissements": ["Akiza", "Avlamè", "Cana I", "Cana II", "Domè", "Koussoukpa", "Kpokissa", "Massi", "Tanwé-Gbéka", "Zogbodomey", "Zoukou"]
      }
    ]
  }
]; 
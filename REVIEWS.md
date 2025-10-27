# Review Summary: IT2810-H25-T26

*Generated on 2025-10-14*

---

## REST API

**Unødvendige og dupliserte API-kall**

Det er rapportert flere tilfeller hvor API-kall gjentas unødvendig, både når «Favorites only» aktiveres (hvor hver favoritt hentes på nytt med ett kall per favoritt-ID) og når samme søk gjentas eller feltet tømmes, som fører til duplikate kall uten at resultatet caches. Dette skjer i favoritt-flyten og ved gjentatte søk i søkefeltet, og skaper ekstra nettverkstrafikk og potensielt tregere respons for brukeren. Konsekvensen er redusert ytelse og unødvendig belastning på både klient og API, spesielt om mange favoritter eller hyppige søk forekommer. Flere foreslår å redusere og dedupere kall ved å hente favoritter i batch, bruke mer robuste query-nøkler og caching i TanStack Query, og unngå refetch ved toggling slik at data gjenbrukes i stedet for å hentes på nytt. 

Reviewer(s): [Nina](#rest-api-nina), [Bob](#rest-api-bob), [Ulrich](#rest-api-ulrich)


**Begrenset paginering (kun første side hentet)**

Implementasjonen henter kun én side fra TMDB (standard 20 resultater) og det er bevisst satt en «cap» på kun side 1 for raskere lastetid, noe som reduserer utvalget som presenteres for brukeren. Dette er observert i søke-/resultatflyten og gjør at brukeren kun kan bla internt blant disse 20 resultatene client-side, noe som kan være tilstrekkelig for oppgaven men begrenser funksjonaliteten ved større behov. Effekten er at relevante treff utenfor første side ikke blir tilgjengelige, noe som kan svekke brukeropplevelsen i mer realistic bruksscenarier. Anbefalte tiltak er å vurdere å hente flere sider ved behov, implementere on-demand paginering eller prefetching for å utvide søkeresultatene uten å ofre lastetid for startsiden.

Reviewer(s): [Bob](#rest-api-bob), [Ulrich](#rest-api-ulrich)


**Stor og uoversiktlig MovieViewer-fil**

Flere av API-kallene og filtreringslogikken synes å være samlet i MovieViewer-filen, noe som gjør filen vanskelig å forstå og vedlikeholde for enkelte gjennomgangere. Dette ble spesielt påpekt av Felix13 som foreslo å dele opp funksjonaliteten i tydeligere moduler eller filer, siden ansvar for kall, filtrering og UI blander seg. Konsekvensen er økt kompleksitet og høyere terskel for videreutvikling eller feilsøking. En enkel forbedring vil være å splitte MovieViewer i separate komponenter/tjenester for API-kall og filterlogikk, og tydeliggjøre ansvar slik at koden blir mer lesbar og lettere å teste.

Reviewer(s): [Felix13](#rest-api-felix13)

---

## HTML, CSS, Typescript

**CSS: filstørrelse, duplisering og enhetsvalg**

CSS-en er generelt ryddig og mobil-først, men enkelte stilfiler har vokst seg store og inneholder noe duplisert styling som border-radius og fargevalg, noe som reduserer gjenbruk og oversikt. Det gjør det vanskeligere å vedlikeholde og finne gjenbrukbare regler når kodebasen vokser, og kan føre til inkonsistente visuelle resultater over tid. Forslagene er å dele opp store CSS-filer i mindre moduler, rydde opp i gjentakelser og vurdere å bruke relative enheter (rem) i stedet for px for bedre skalerbarhet på ulike skjermer. Dessuten ble det foreslått å innføre egne klasser for å unngå at endringer påvirker mange elementer samtidig, noe som vil øke kontroll og forutsigbarhet i stylingen.

Reviewer(s): [Ulrich](#html--css--typescript-ulrich), [Bob](#html--css--typescript-bob), [Nina](#html--css--typescript-nina)


**Tilgjengelighet: manglende etiketter og liste-semantikk**

Selv om siden har god semantikk og ARIA-bruk flere steder, er det enkelte tilgjengelighetsmangler som bør rettes opp for å gjøre opplevelsen komplett. Eksempelvis rendres filmforslag som <li> uten en omsluttende <ul>, og søkefeltet mangler eksplisitt label eller aria-label slik at skjermlesere kan misforstå feltet når placeholder forsvinner. Dette kan gjøre navigasjon og kontekstforståelse vanskeligere for brukere av hjelpemidler og svekke robustheten i skjermleseropplevelsen. Enkle tiltak som å pakke listeelementer i en <ul class="..."> og gi input-felter skjulte, men eksplisitte labels eller aria-attributter vil løse problemene og forbedre tilgjengeligheten merkbart.

Reviewer(s): [Nina](#html--css--typescript-nina), [Beau2](#html--css--typescript-beau2)


**Store komponenter — del opp MovieViewer for bedre lesbarhet**

Noen komponenter har vokst seg svært store, særlig MovieViewer som nærmer seg 500 linjer, noe som gjør koden vanskelig å lese og vedlikeholde. Når en komponent inneholder så mye logikk og markup samtidig, blir det tyngre å teste, gjenbruke og forstå ansvarsfordelingen. Anbefalingen er å splitte større komponenter opp i mindre, tydeligere underkomponenter og flytte logikk til hooks eller hjelpefunksjoner der det gir mening. Dette vil øke lesbarheten, gjøre komponentene enklere å teste og forbedre muligheten for gjenbruk.

Reviewer(s): [Felix13](#html--css--typescript-felix13), [Oscar](#html--css--typescript-oscar)


**Feil ved filtrering: genre_ids undefined ved favoritter**

Det finnes en konkret runtime-feil når man kombinerer "Favorites only" med sjangerfilter: appen kaster TypeError: j.genre_ids is undefined og krever at hele siden lukkes for å komme seg videre. Problemet oppstår fordi Movie-typen forventer genre_ids: number[] mens favoritter enten kan mangle dette feltet eller ha det som genres, slik at sortering på sjanger feiler. Dette fører til fullstendig krasj og dårlig brukeropplevelse ved visse filterkombinasjoner. Forslag til utbedring er å gjøre genre_ids valgfritt i typen, sikre at favoritter lagrer det samme feltet, og legge til tester som dekker kombinasjoner av filtre for å fange slike feil tidlig.

Reviewer(s): [Nina](#html--css--typescript-nina)


**TypeScript: eksplisitte returtyper på funksjoner**

TypeScript-typene er i stor grad gode, men enkelte funksjoner mangler eksplisitt angitt returtype, for eksempel clearSearch = () => {...}, hvor det ville vært mer presist å skrive const clearSearch = (): void => {...}. Å legge på eksplisitte returtyper øker lesbarheten og sikrer at utilsiktede returverdier avsløres tidlig i utvikling. Dette er en liten, men nyttig forbedring som gjør grensesnittene tydeligere for andre utviklere og statiske kontroller. Samtidig er det positivt at typedefinisjoner ligger i egen mappe, så å konsekvent bruke returtyper vil komplementere den eksisterende strukturen godt.

Reviewer(s): [Ulrich](#html--css--typescript-ulrich)

---

## Dokumentasjon

**For mye ordbruk og enkelte generiske avsnitt**

Flere steder i dokumentasjonen oppleves språket som tungt og noen avsnitt som generiske, noe som kan gjøre det mindre effektivt å finne essensiell informasjon raskt. Dette er særlig merket i enkelte forklarende seksjoner i README-en hvor teksten kunne vært mer presis og konsis. Konsekvensen er at nye lesere eller testere kan bruke unødvendig tid på å tolke hva som er viktig, og at viktig informasjon kan bli oversett. Anbefalingen er å korte ned og konkretisere disse avsnittene, bruke punktlister eller eksempler der det hjelper, og vurdere å flytte detaljer til separate underseksjoner eller vedlegg for bedre lesbarhet.

Reviewer(s): [Nina](#dokumentasjon-nina), [Oscar](#dokumentasjon-oscar)

   
**Uklart API-oppsett og autentisering**

Dokumentasjonen mangler klare instruksjoner for hvordan man skaffer og bruker API-nøkkel, og en lenke til nøkkeladministrasjonen fører til en feilmelding om manglende tilgang. Dette oppstår i oppsettsdelen som beskriver hvordan man setter opp API-en for lokal testing, og gjør det knotete for testere å komme i gang. Følgen er at lokal testing stoppes eller blir forsinket, noe som reduserer effektiviteten ved verifikasjon og feilfinning. Det foreslås å legge inn trinnvise steg for å opprette konto og hente nøkkel, forklare nødvendige rettigheter/roller, samt inkludere feilsøkingstips og eksempelinnstillinger for autentisering.

Reviewer(s): [Nina](#dokumentasjon-nina)

   
**Manglende "Known Issues" / oversikt over kjente feil**

Det mangler en dedikert seksjon for kjente problemer, selv om testingen har avdekket konkrete temaer som Favoritter og Sjanger som bør dokumenteres. Dette gjelder funksjonalitet i nettsiden som testere kan støte på og som foreløpig ikke er fullstendig løst eller forventes å endre seg. Uten en slik oversikt kan brukere og sensorer bruke tid på å rapportere eller feilsøke problemer som allerede er kjent, og det svekker transparensen rundt prosjektstatus. Derfor anbefales det å legge til en "Known Issues"-fane eller seksjon i dokumentasjonen som beskriver aktuelle begrensninger, arbeid rundt dem og status/plan for utbedring.

Reviewer(s): [Nina](#dokumentasjon-nina)

---

## Læringsutbytte

**Solid, kravoppfyllende og funksjonell løsning**

Gruppen har levert en tydelig solid og kravoppfyllende løsning som fungerer som forventet, noe som ble spesielt fremhevet i tilbakemeldingene. Dette gjelder prosjektets helhetlige leveranse og demonstrerer at kravene er forstått og implementert på en konsistent måte. At løsningen møter kravene påvirker prosjektets troverdighet positivt og viser at læringsutbyttet er oppnådd i praksis. For å opprettholde dette kan gruppen fortsette å dokumentere kravoppfyllelse og teste løsningens funksjonalitet jevnlig.

Reviewer(s): [Nina](#l-ringsutbytte-nina), [Ulrich](#l-ringsutbytte-ulrich)


**Høyt teknisk kompetansenivå og gode teknologistandarder**

Vurderingen fremhever en klar og solid forståelse av moderne teknologi som React, TypeScript, TanStack Query, API-integrasjoner og testing, noe som vises i implementasjonen og arkitekturvalg. Disse teknologistandardenes anvendelse gjør løsningen mer robust, vedlikeholdbar og skalerbar, og vitner om et høyt faglig nivå hos gruppen. At valg er godt begrunnet og dokumentert styrker også prosjektets faglige kvalitet og gir bedre sporbarhet for videre utvikling. Fortsett å begrunne teknologivalg og opprettholde dokumentasjonen for å gjøre overlevering og videreutvikling enklere.

Reviewer(s): [Ulrich](#l-ringsutbytte-ulrich)


**Sterkt inntrykk og høy ambisjon i prosjektet**

Prosjektet opplevdes som imponerende og ambisiøst av en av sensorene, noe som indikerer at arbeidet skaper positivt engasjement utenfor gruppen. Dette ytre inntrykket kan være nyttig ved presentasjoner, videre formidling eller ved å søke støtte/feedback fra andre fagpersoner. Et sterkt inntrykk bidrar til motivasjon og kan åpne dører for videre utvikling eller samarbeid hvis gruppen velger å utnytte det. Det anbefales å bruke dette momentumet aktivt ved å fremheve prosjektets suksesser i dokumentasjon og demonstrasjoner.

Reviewer(s): [Bob](#l-ringsutbytte-bob)

---

## Responsivt design

**Filterkontroller og vurderingsfilter (rating) er inkonsekvente og begrensede**

Filterpanelet har flere begrensninger: det er ikke mulig å fjerne ett enkelt valgt filter uten å rydde alle, og rating-filteret vises og oppfører seg forskjellig mellom mobil og desktop, hvor mobilutgaven mangler en mulighet for å angi minimumsrating. Dette påvirker brukervennligheten ved at det blir tungvint å justere søk og kan skape forvirring når samme funksjon oppfører seg ulikt på ulike enheter. Flere påpeker også at det kan være overflødig med to forskjellige rating-filtre, så en sammenslåing eller forenkling vil gjøre grensesnittet klarere. Forslaget er å gjøre det mulig å fjerne individuelle filtre, harmonisere rating-filteret mellom mobil og desktop og vurdere å konsolidere dupliserte rating-kontroller for en mer konsistent og effektiv brukeropplevelse.

Reviewer(s): [Nina](#responsivt-design-nina), [Beau2](#responsivt-design-beau2)


**Plassutnyttelse og plassering av filterknapp på store skjermer**

På større skjermer utnyttes plassen ikke optimalt, noe som gjør at layouten kan virke luftig eller ineffektiv, og noen kontroller kan oppleves unødvendig store eller feilplassert. Det pekes spesielt på at filterknappen kunne vært mindre og flyttet ved siden av søkefeltet for å frigjøre plass og redusere visuelt rot, eventuelt ved å gjøre søkefeltet litt smalere. Dette vil gi bedre balanse i topplinjen og bedre utnyttelse av brede visninger uten å gå på bekostning av mobilopplevelsen. Anbefalingen er å justere størrelser og plasseringer for desktop-visningen, teste en mindre filterknapp ved siden av søket og optimalisere layouten for større skjermer.

Reviewer(s): [Bob](#responsivt-design-bob), [Oscar](#responsivt-design-oscar)

---

## Utforming og stiling

**Uklart listevalg og plassering av navigasjon**

Listen over filmer og valg-knappen oppleves ikke intuitiv og fremstår mer som en detalj som skal oppfylle et krav enn som et funksjonelt valg. Dette blir spesielt tydelig når brukere ikke forstår hva listevalget representerer; det mangler en forklarende prompt eller etikett som sier hva listen inneholder eller gjør. Plasseringen av navigeringspilene ble også trukket frem som upassende — å flytte dem under individuell filmvisning og plassere listevalget rett under kan gjøre interaksjonen mer fokusert og gi rom for en forklaring av hva listevalget baserer seg på. Å legge til en kort beskrivelse eller tooltip og justere plasseringen av pilene vil øke brukervennlighet og gjøre funksjonene tydeligere for nye brukere.

Reviewer(s): [Nina](#utforming-og-stiling-nina)

---

**Inkonsistent dropdown-adferd og pilindikator**

Dropdownene fungerer for det meste bra, men det er inkonsistens i både visuell tilbakemelding og lukke-adferd i enkelte dropdowns. Spesifikt savnes en tydelig endring av pilens form (for eksempel fra pil ned til sidepil) når dropdownen åpnes, og popularity-dropdownen lukker ikke konsekvent ved klikk utenfor. Dette kan skape forvirring og bryte forventet oppførsel, spesielt for brukere som stoler på visuelle indikatorer for tilstand. En løsning er å implementere en konsekvent pil-rotasjon eller ikonbytte ved åpning/lukking og sikre at alle dropdowns bruker samme utenfor-klikk-håndtering.

Reviewer(s): [Beau2](#utforming-og-stiling-beau2)

---

**Dobbel "fjern input" (X) i søkefeltet**

Søkefeltet viser to kryss-ikoner for å fjerne input når feltet er i fokus, noe som skaper en dobbel visuell knapp for samme funksjon. Dette skjer i selve søkefeltet og kan virke forvirrende eller overflødig for brukeren, særlig på små skjermer eller ved rask interaksjon. Effekten er redusert klarhet i kontrollene og muligens feiltrykk, som svekker brukeropplevelsen i en sentral funksjon. En enkel fiks er å fjerne det ene ikonet eller konsolidere funksjonaliteten slik at bare én tydelig fjern-knapp vises når nødvendig.

Reviewer(s): [Ulrich](#utforming-og-stiling-ulrich)

---

**Vedlikeholdbarhet av CSS — vurdering av rammeverk**

Stilen er ren og robust takket være bruk av CSS custom properties og fallback-løsninger, men det ble foreslått å vurdere et CSS-rammeverk som Tailwind for å forenkle vedlikeholdet. Valget av plain CSS gir godt læringsutbytte og kontroll, men et rammeverk kan redusere repetisjon og gjøre det raskere å endre stil på tvers av komponenter i et større prosjekt. Vurder å lage en kost-nytte-analyse av å migrere eller gradvis innføre et utility-rammeverk for å se om det sparer tid i videre utvikling uten å miste den nåværende kodekvaliteten.

Reviewer(s): [Alice](#utforming-og-stiling-alice)

---

## Web storage API

**Favoritter lagres i localStorage**

Favoritter lagres konsekvent i localStorage, noe som gjør at brukernes favoritter beholdes mellom økter og gir en forutsigbar og vedvarende opplevelse. Dette er implementert i applikasjonens favorittfunksjon og blir fremhevet av flere anmeldere som en hensiktsmessig løsning for persistens. Løsningen bidrar positivt til brukeropplevelsen ved å sikre at preferanser ikke går tapt ved lukking eller oppdatering av nettleseren. Flere foreslår å sørge for god synkronisering mellom faner (enten via storage-event eller bruk av useSyncExternalStore) for å unngå inkonsistente favorittvalg på tvers av åpne faner.

Reviewer(s): [Nina](#web-storage-api-nina), [Bob](#web-storage-api-bob), [Ulrich](#web-storage-api-ulrich), [Alice](#web-storage-api-alice), [Felix13](#web-storage-api-felix13), [Oscar](#web-storage-api-oscar), [Beau2](#web-storage-api-beau2)

**Generell effektiv bruk av Web Storage og god brukeropplevelse**

Gjennomgående gir bruken av localStorage og sessionStorage en effektiv og intuitiv brukeropplevelse, med rask gjenoppretting av søk, filtre og visningsvalg ved behov. Anmelderne peker på at lagringsstrategien er veldesignet for formålet og forbedrer både ytelse og brukervennlighet. Dette reduserer friksjon for brukeren ved reload eller ved å navigere i appen, og viser god forståelse av når data bør være persistente versus midlertidige. Forslaget implicit i tilbakemeldingene er å opprettholde denne pragmatiske tilnærmingen og videreføre samme tydelige ansvarsdeling i lagringen.

Reviewer(s): [Nina](#web-storage-api-nina), [Bob](#web-storage-api-bob), [Ulrich](#web-storage-api-ulrich), [Alice](#web-storage-api-alice), [Felix13](#web-storage-api-felix13), [Oscar](#web-storage-api-oscar), [Beau2](#web-storage-api-beau2)

**SessionStorage for søk og filtre**

Søketerm og filtervalg er lagret i sessionStorage (for eksempel i SearchBar.tsx og i MovieViewer for navigasjonsposisjon), slik at brukerens kontekst gjenopprettes ved reload i samme økt uten å dele tilstanden mellom faner. Dette gir en god balanse mellom persistens og isolasjon, ved at midlertidige valg ikke blir permanente eller globale. Implementeringen forbedrer brukeropplevelsen ved å la brukeren fortsette der de var etter en oppdatering, samtidig som det unngår å forurense andre økter. Flere anmeldere mener løsningen er hensiktsmessig, men nevner at enkelte funksjoner (som favoritter) kan dra nytte av kryss-fane-synkronisering hvis det er ønsket.

Reviewer(s): [Nina](#web-storage-api-nina), [Bob](#web-storage-api-bob), [Ulrich](#web-storage-api-ulrich), [Felix13](#web-storage-api-felix13), [Oscar](#web-storage-api-oscar), [Alice](#web-storage-api-alice)

**Synkronisering mellom faner**

Anmelderne nevner behovet for kryss-fane-synkronisering spesielt i forbindelse med favoritter og andre delte tilstander, hvor forskjeller mellom faner kan skape forvirring. Noen implementasjoner har allerede tatt dette hensyn (bruk av useSyncExternalStore), mens andre påpeker at storage-event kan benyttes for å oppdatere tilstanden i alle åpne faner. Uten slik synkronisering risikerer man at brukerens handlinger i én fane ikke reflekteres i en annen, noe som svekker konsistensen i UX. Forslaget er å bruke enten browserens storage-event eller eksisterende synkroniseringsmønstre for å holde UI konsistent på tvers av faner.

Reviewer(s): [Nina](#web-storage-api-nina), [Alice](#web-storage-api-alice), [Oscar](#web-storage-api-oscar)

**Lagringslogikk samlet i utils/localStorage.ts**

Lagringslogikken er flyttet til en egen fil (utils/localStorage.ts), noe som gir bedre oversikt og gjør det enklere å endre lagringsstrategi eller legge til funksjoner. Dette ble fremhevet som en positiv arkitekturendring som forbedrer vedlikeholdbarhet og modularitet i koden. Å ha et sentralt lagringslag gjør det også enklere å teste og dokumentere adferd knyttet til persistering. Anmelderen anbefaler å fortsette denne praksisen for å holde lagringsansvaret isolert og lett omskrivbart ved behov.

Reviewer(s): [Ulrich](#web-storage-api-ulrich)

---

## Bruk av git

**Store pull requests og manglende dev-branch**

Pull requests er for store og det er få issues (bare 14 totalt), noe som fører til PR-er på flere tusen linjer og gjør gjennomgang og historikk vanskelig å følge. Dette er observert i prosjektet og fører til at det blir krevende for andre å forstå endringer PR for PR, samt øker risikoen for feil ved sammenslåing til main. Anbefalingen var å dele opp større arbeid i flere mindre issues og PR-er, samt innføre en dev-branch som dere jobber mot og periodisk merger inn i main i stedet for å merge hver PR direkte til main. Å bryte ned oppgaver vil gjøre code review enklere, forbedre sporbarheten og redusere risiko ved deploy.

Reviewer(s): [Felix13](#bruk-av-git-felix13)


**Manglende kobling mellom issues og pull requests**

Det ble påpekt at ikke alle issues og pull requests er tydelig koblet sammen, noe som gjør det vanskelig å se hvilke endringer som hører til hvilke problemer eller funksjoner. Dette ble nevnt i forbindelse med arbeidsflyten i repositoryet, og påvirker prosjektets historikk ved at det blir mindre klart hvorfor en endring ble gjort hvis noe uventet skjer senere. Forslaget var å knytte alle PR-er og commits eksplisitt til relevante issues slik at det blir en tydelig historikk og enklere å feilsøke eller revidere endringer. En slik praksis vil forbedre sporbarheten og gjøre det enklere for nye bidragsytere å forstå sammenhengen mellom arbeid og kodeendringer.

Reviewer(s): [Nina](#bruk-av-git-nina)


**Overfladiske review-kommentarer fra noen reviewers**

Det ble nevnt at enkelte review-kommentarer kan være mer tilfeldige og overfladiske enn nødvendigvis nyttige, selv om det også finnes gode og relevante kommentarer i repoet. Dette skjer i selve kodegjennomgangene og kan svekke kvaliteten på feedback og læring i teamet dersom kommentarene ikke peker på konkrete forbedringer eller problemer. Anbefalingen var å fokusere på mer gjennomtenkte og konkrete kommentarer ved code review, slik at hver kommentar bidrar til reell forbedring av koden og dokumentasjonen. Bedre kvalitet på review-kommentarer vil styrke kodekvalitet og teamets evne til å fange opp feil tidlig.

Reviewer(s): [Nina](#bruk-av-git-nina)

---

## Utforming og interaksjon

**Begrensede år i filterpanelet**

Filterpanelet tilbyr kun enkelte årstall (nevnt: 2022, 2024 og 2025), noe som gjør at eldre eller andre relevante utgivelser ikke kan velges gjennom panelet selv om de finnes i datagrunnlaget. Dette begrenser brukernes mulighet til å finne og sortere filmer etter ønsket utgivelsesperiode og kan føre til forvirring når søkeresultater viser filmer som ikke lar seg filtrere. Forbedring kan være å utvide årskategorien til et komplett utvalg eller å legge til et "fra–til"-felt slik at brukeren kan angi et årsspenn eller en åpen grense (f.eks. fra et år og eldre). Dette vil gjøre filtreringen mer komplett og forventningsstyrende for brukeren.

Reviewer(s): [Beau2](#utforming-og-interaksjon-beau2), [Felix13](#utforming-og-interaksjon-felix13)

---

**Filterpanelets lukke- og visningslogikk**

Filterpanelet fungerer og er detaljert, men det er ikke intuitivt hvordan man lukker det fordi brukeren må trykke filterknappen igjen for å lukke vinduet. Dette oppleves som en mindre god UX, spesielt siden panelet framstår som et pop-up i stedet for et integrert panel, og en eksplisitt lukke-knapp eller en mer permanent visning kunne gjort interaksjonen tydeligere. Endringen vil gjøre det enklere for brukeren å kontrollere panelet og redusere frustrasjon ved at handlingen for å lukke blir tydelig og forutsigbar. Vurder å legge inn en egen lukkeknapp, eller tilby en persistent sidepanel-variant i stedet for en pop-up.

Reviewer(s): [Nina](#utforming-og-interaksjon-nina)

---

**Uklart formål for valglisten med filmer**

Listen der man kan velge filmer fungerer teknisk, men det er uklart for brukeren hva listen skal gjøre og hvorfor den er der; brukeren må ofte klikke seg inn for å finne ut av funksjonen. Dette svekker oppdagbarheten og kan føre til at funksjonen blir oversett eller misbrukt, noe som reduserer effektiviteten i navigasjonen. Enkle tiltak som klarere etiketter, hjelpetekst, plassholdertekst eller en kort instruksjon kan gjøre formålet umiddelbart forståelig. Å gjøre intensjonen eksplisitt vil forbedre flyten og redusere behovet for gjetning fra brukerens side.

Reviewer(s): [Nina](#utforming-og-interaksjon-nina)

---

**Kritisk kjøre­tidsfeil ved valg av favoritter og filtrering**

Det er rapportert en alvorlig feil: "Uncaught TypeError: can't access property 'includes', j.genre_ids is undefined" når man velger en favoritt i kombinasjon med filtrering, og denne feilen gjør at skjermen blir hvit og nettsiden må startes på nytt. Dette stopper hele brukeropplevelsen og er et blokkende problem for funksjonaliteten knyttet til favoritter og filtrering. Feilen bør fikses i koden ved å legge inn null-/undefined-sjekker før man kaller includes på genre_ids, samt generell feilhåndtering og eventuelt fallback-logikk for manglende data. Å rette dette vil gjenopprette stabilitet og forhindre at brukere mister tilstanden eller må foreta manuell restart.

Reviewer(s): [Nina](#utforming-og-interaksjon-nina)

---

**Visningsposisjon nullstilles ved refresh selv om filtre huskes**

Filtrene lagres og huskes ved oppdatering av siden, men etter refresh havner brukeren tilbake på den første filmen i listen i stedet for der de var sist. Dette gjør at konteksten og arbeidsflyten brytes, spesielt ved lange lister eller når brukeren jobbet seg gjennom flere elementer før oppdatering. En forbedring er å bevare gjeldende indeks eller valgt film i state/localStorage slik at både filtervalg og gjeldende visningsposisjon gjenopprettes ved reload. Slik opprettholdes kontinuitet i brukeropplevelsen og man unngår at brukeren må finne tilbake til samme plass manuelt.

Reviewer(s): [Beau2](#utforming-og-interaksjon-beau2)

---

## React

**Omfattende bruk av hooks og custom hooks**

Prosjektet gjør bred og konsekvent bruk av både innebygde hooks og egne custom hooks som useDebounce, useFavorites, useFilters og React Query i sentrale komponenter som søkefeltet og App. Dette er implementert på en måte som begrenser unødvendige API-kall (debounce), samler delt logikk og gjør komponentene enklere å vedlikeholde og utvide. Flere anmeldere fremhever at denne tilnærmingen forbedrer ytelse, gjenbrukbarhet og gjør det lett å legge til ny funksjonalitet uten å rote til komponentene. Anbefalingen fra noen av dem er å fortsette å samle delt logikk i hooks, siden det allerede gjør koden modulær og enkel å videreutvikle.

Reviewer(s): [Nina](#react-nina), [Bob](#react-bob), [Ulrich](#react-ulrich), [Alice](#react-alice), [Oscar](#react-oscar), [Beau2](#react-beau2), [Felix13](#react-felix13)


**Klar state- og props-håndtering med god typesikkerhet**

State håndteres konsekvent med useState/useEffect og props er tydelig brukt og typet (bl.a. egne interfaces), noe som gir god separasjon mellom datahenting og presentasjon, for eksempel ved at App kun videresender movies til MovieViewer og FilterPanel får presise props. Dette gjør komponentene mer forutsigbare, enklere å teste og gjenbruke, og bidrar til at UI-logikk holdes isolert fra dataflyt og sideeffekter. Ulrich påpeker også at useEffect og useRef er brukt på en fornuftig måte for å kontrollere søk og lagring i sessionStorage, noe som gir god kontroll over sideeffekter. Samlet sett oppfordrer tilnærmingen til videre opprettholdelse av denne praksisen for å bevare klarheten og typesikkerheten i prosjektet.

Reviewer(s): [Nina](#react-nina), [Bob](#react-bob), [Ulrich](#react-ulrich), [Alice](#react-alice), [Felix13](#react-felix13), [Oscar](#react-oscar), [Beau2](#react-beau2)


**Ryddig komponentstruktur og filorganisering**

Kodebasen er organisert i egne mapper med komponenter og CSS per komponent, og filplasseringen gjør importene tydelige og prosjektet lett å navigere. Flere anmeldere beskriver mappestrukturen og modulær arkitektur som intuitiv og i tråd med beste praksis, noe som gjør det enklere for teamet å jobbe effektivt og for nye bidragsytere å finne fram. God fil- og mappeorganisering bidrar også til bedre testbarhet og vedlikehold av prosjektet over tid. Anbefalingen er å opprettholde denne strukturen etter hvert som prosjektet vokser, for å bevare oversikt og konsistens.

Reviewer(s): [Nina](#react-nina), [Felix13](#react-felix13), [Oscar](#react-oscar), [Beau2](#react-beau2), [Ulrich](#react-ulrich), [Alice](#react-alice)


**Feil ved kombinasjon av favoritt og sjanger**

Nina nevner at det finnes en feil når favoritt-filter kombineres med sjanger-filter, men at denne feilen er omtalt og adressert et annet sted i tilbakemeldingen slik at hun ikke utdyper den her. Denne typen feil kan påvirke korrekt filtrering og gi brukerne feilaktige resultater når flere filtre er aktive samtidig. Siden den er notert som adressert, bør teamet forsikre seg om at løsningen er testet grundig for alle relevante kombinasjoner av filtre. Det kan være nyttig å dokumentere fiksen og inkludere enhetstester som verifiserer at kombinasjoner av favoritter og sjangre fungerer som forventet.

Reviewer(s): [Nina](#react-nina)

---

## Generell vurdering av løsninger

**Store filer og store pull requests**

Noen filer i prosjektet oppleves som tidvis for store og kunne med fordel blitt delt opp, og det finnes få issues som gjør at pull requests blir unødvendig store. Dette skjer i kode- og filstrukturen i repoet og påvirker gjennomgangen ved at det blir tungt å lese og vurdere endringer effektivt. Konsekvensen er økt risiko for oversette feil, langsommere tilbakemelding og vanskeligere samarbeid ved merging. Forslagene er å splitte større filer i mindre moduler, opprette tydeligere og flere issues for avgrensede oppgaver, og levere hyppigere, mindre pull requests for enklere review og mer iterativ utvikling.

Reviewer(s): [Felix13](#generell-vurdering-av-l-sninger-felix13)


**Oppfyller kravene og holder høy standard**

Prosjektet vurderes å innfri alle oppgavekrav på en strukturert og ryddig måte, med god overordnet struktur, høy kodekvalitet, solid dokumentasjon og en god presentasjon av appen. Dette gjelder helheten i prosjektet og gir et klart inntrykk av at de fastsatte kriteriene er oppfylt. Effekten er økt tillit til løsningen og at videre arbeid kan bygge videre på et godt fundament. Anbefalingen er å opprettholde denne standarden videre, både i kodearbeid og dokumentasjon, for å sikre vedvarende kvalitet.

Reviewer(s): [Ulrich](#generell-vurdering-av-l-sninger-ulrich)

---

## Testing

**Utestet hook: useFocusTrap**

Det er rapportert at hooken useFocusTrap ikke har egne tester, selv om de fleste andre komponenter og hooks er dekket. Manglende tester for denne hooken gjør at fokuslogikk og tilgjengelighetsrelatert oppførsel kan gå ubemerket i endringer, og øker risikoen for regresjoner i modal- eller navigasjonsflyt. For å lukke dette bør dere lage dedikerte tester som mocker DOM-fokus, simulerer tastaturhendelser og verifiserer at fokus faktisk blir fanget og frigitt som forventet, på samme måte som dere har gjort for andre hooks. Dette vil gi bedre dekning og trygghet rundt tilgjengelighetsatferd i applikasjonen.

Reviewer(s): [Bob](#testing-bob), [Felix13](#testing-felix13)

---

**Sjanger‑id-buggen slapp gjennom testene og behov for eksploratorisk robusthetstesting**

En feil knyttet til sjanger-id har klart å passere eksisterende tester, noe som peker på mangler i testtilfeller eller realisme i mocked data. Feilen påvirker funksjonalitet ved filtrering/visning av filmer og svekker tilliten til at testene fanger kritiske edge‑cases før release. Anbefalingen er å legge til spesifikke tester som reproducerer sjanger‑id‑scenarier (inkludert negative/ugyldige id-er), opprette regresjonstester for feilen, og gjennomføre eksploratorisk "break"-testing manuelt i nettleseren for å avdekke hvordan applikasjonen oppfører seg under uventede input. I tillegg kan mer realistisk mocking av API-responser og flere integrasjonstester gjøre testene mer robuste mot slike glipper.

Reviewer(s): [Nina](#testing-nina)

---


# Original Feedback

## REST API

<a id="rest-api-nina"></a>
**Reviewer Nina:**

> - Det er løst på en god måte. med god oversikt ved å ha all API integrasjon samlet i én fil \(tmdbApi.ts\).
> 
> - Det er bra at søk og filtrering er debouncet for å unngå unødvendige API-kall, og genre-data caches i 24 timer for ytelse. Når jeg bruker devTool og filterer på XHR i network, kan jeg tydelig se at debounce fungerer. Jeg kan se hvert kall for hvert søk. Når jeg skriver sakte kommer det opp kall for hver bokstav jeg skriver, når jeg skriver fort kommer det opp kall for ordet. Dette understreker at searchbar sin debounce fungerer godt.
> 
> - Favorites only har unødvendige API-kall. Hver gang jeg aktiverer "Favorites only" hentes favorittfilmene på nytt \(ett kall per favoritt-ID\). 

<a id="rest-api-bob"></a>
**Reviewer Bob:**

> En veldig god løsning å ha en cap på page 1 slik at siden ikke bruker unødvendig med tid på å loade. Dette gjør at utvalget blir redusert, men for denne oppgaven funker det. Kallene er presise og funksjonsnavnene tilsier akkurat hva slags informasjon som blir hentet ut. Det er en del kall som ikke blir brukt, men skader jo ikke å ha mulighet til å gjøre de kallene til eventuell videreutvikling. 

<a id="rest-api-ulrich"></a>
**Reviewer Ulrich:**

> All API-logikk er samlet i en fil, noe som gir god oversikt og gjør det enkelt å vedlikeholde og endre API-kall.
> 
> TanStack Query er på plass som er bra. 
> 
> Hvis jeg søker på samme film flere ganger og krysser den ut i søkefeltet og gjør det igjen sendes det duplikat API-kall med samme informasjon, det blir altså ikke cachet i dette tilfellet
> 
> Det blir kun hentet en side fra TMDB \(med 20 resultater\) av gangen, så kan brukeren bla frem og tilbake blandt disse 20 resultatene client side
> 
> Bra jobba!

<a id="rest-api-alice"></a>
**Reviewer Alice:**

> TMDB-integrasjonen er abstrahert i en egen service \(tmdbApi.ts\), med typed endpoints og caching via TanStack Query. Det gir ryddig struktur og reduserer feil. Feilhåndtering er på plass.

<a id="rest-api-felix13"></a>
**Reviewer Felix13:**

> Gruppen bruker TMDB rest api og benytter seg at tanstack query for caching. MovieViewer ser ut til å være filen hvor mye av kallene til api-et skjer. I denne filen skjer det også filtrering gjennom kall til useFIilters hooken dere har laget. Jeg ville som nevnt tidligere muligens prøvd å dele opp denne funksjonaliteten tydeligere i to filer. \(Men akkurat den filen slet jeg med å forstå ordentlig, og jeg kan ha misforstått noe\) 

<a id="rest-api-oscar"></a>
**Reviewer Oscar:**

> Bruken av rest api er godt løst med sentralisert service fil og sterke typer, noe som gir en ryddig og testbar kode. TanStack Query sørger for caching, refetching og god feilhåndtering, mens debounce i søk reduserer unødvendige kall.

<a id="rest-api-beau2"></a>
**Reviewer Beau2:**

> Jeg ser at dere har samlet all API logikken deres inne i services/tmdbAPI.ts, med veldig tydelige funksjoner som getPopularMovies, getGenres, osv...
> Dere har god bildehåndtering med getImageUrl og fallback dersom poster_path mangler, som er god praksis.
> Dere bruker også TanStack Query \(useQuery\) som gir god gjenbruk av data :\)

---

## HTML, CSS, Typescript

<a id="html--css--typescript-nina"></a>
**Reviewer Nina:**

> Styrker:
> - Det er en gjennomgående god semantikk i koden, med lite unødvendig bruk av <div>, og <button> brukes konsekvent. Samt at det er en ryddig og bra unyttelse av ARIA. Det er klart at koden i de brede strøkene følger prinsippene som er beskrevet i forelesningene ledende opp mot prosjektet. Dette gjør at det er enkelt og tydelig å følge koden. 
> 
> - Det er en god heading-struktur der det er relevant, som legger tilrette for en tydelig og enkel side.
> 
> - Nettsiden fungerer overraskende enkelt gjennom tastatur-navigasjon, ved å åpne filterpanelet med role="dialog". Dette er en god løsning og gjør det meget raskt å navigere seg rundt.
> 
> - Det er bra at det er en egen storage helper som letter opp fra å ha masse try/catch overalt, slik kravene ber om.
> 
> - CSS strukturen er fin og oversiktlig, og det er bra gruppen har tenkt på mobil-først prinsippet. Fint at nested CSS blir benyttet også.
> 
> Bør fikses:
> Når man kombinerer "Favorites only" med sjangerfilter kaster `TypeError: j.genre_ids is undefined`. Man må lukke hele nettsiden, for å komme seg ut av denne crashen. Hele skjermen blir hvit.
> "Movie" trenger genre_ids: number\[\], men når det legges inn i favoritter kan dette feltet bli byttet ut \(genres\) eller ikke eksistere. Når det da sorteres på sjanger, vil TypeError-en kastes. Kan gjøre feltet valgfritt for å fikse dette. Kunne laget en test som sjekket alle de forskjellige kombinasjonene av filtrering for å prøve å fange dette.
> 
> Kan forbedres:
> Selv om tilgjengelighet er tenkt på, kunne det også vært mer omfattende. Det er forståelig at det ikke er laget tilgjengelighets-tiltak gjennom hele brukeropplevelsen, da nettsiden i seg selv er veldig ren og oversiktlig. Når det kommer til semantikken
> Listen over forslag for filmer rendres som <li> uten <ul>, dette gjør at det ikke blir en liste som er like godt strukturert. Kan bruke <ul class="..."> for å forbedre hvordan listen blir pakket.
> For å unngå at alle elementer endres samtidig kan det lages egne klasser.

<a id="html--css--typescript-bob"></a>
**Reviewer Bob:**

> Veldig god bruk av HTML tags. Det er brukt minimalt med <div>, og der det er brukt gir det mening at det skal være det. filer for ts, tsx og css i hver sin fil gjør det oversiktlig og strukturen gir mening. Typene brukt i typescript gir økt sikkerhet og er brukt konsekvent. I css filene kunne det kanskje vært brukt mer rem istedenfor px, da dette kan gjøre at utformingen kan bli litt liten på noen skjermer, men å ha breakpoints er jo også en veldig god løsning.

<a id="html--css--typescript-ulrich"></a>
**Reviewer Ulrich:**

> html:
> Bruk av semantiske elementer som <section>, <main>, <aside>, og <nav> gir god struktur og hjelper tilgjengelighet.
> ARIA-attributter og live region for skjermlesere er positivt.
> 
> css:
> Modulbasert CSS gir god oversikt og gjør det enkelt å vedlikeholde.
> Bruk av media queries gir god responsivitet.
> Detaljert styling av interaktive elementer \(sliders og chips\) gir et moderne uttrykk.
> CSS-filene er store og kan med fordel deles opp ytterligere for bedre oversikt og gjenbruk.
> Det er noe duplisert styling \(eks: border-radius, fargevalg\).
> 
> 
> typescript:
> Typedefinisjoner i egen mappe gir god oversikt.
> Eneste er at funksjoner som clearSearch = \(\) => {....
> mangler spesifisert returntype void.
> 
> feks:
> const clearSearch = \(\): void => {
> som hadde vært bedre, men dette er veldig pirkete.
> 
> Men overall, veldig bra 

<a id="html--css--typescript-alice"></a>
**Reviewer Alice:**

> HTML: Semantisk oppbygning \(main, section, article, nav\) og ARIA-attributter viser fokus på standarder og tilgjengelighet.
> 
> CSS: Klart organisert med egne filer, responsivt og konsistent.
> 
> TypeScript: Omfattende bruk av typer, interfaces og generisk statehåndtering. Gir både sikkerhet og struktur.

<a id="html--css--typescript-felix13"></a>
**Reviewer Felix13:**

> Css koden er ryddig og oversiktlig. Typescript koden er for det meste ryddig og lett lese, men i MovieViewer som er nesten 500 linjer lang at det brude vært mulig å dele den opp i flere komponenter for å gjøre den lettere å lese. Det blir også brukt riktige HTML elementer hvor det spesifikke elementet er egnet. I tillegg er HTML tilgjenglighetsfunksjoner også dekket slik som navigering med piltaster mellom filmer, tabbing for navigering på siden.

<a id="html--css--typescript-oscar"></a>
**Reviewer Oscar:**

> Koden er godt strukturert med fokus på tilgjengelighet \(aria-labels, semantiske elementer, fokus-håndtering\). Bruken av hooks og useMemo/useCallback gir ryddig state-håndtering og bedre ytelse. CSS er godt organisert med responsive løsninger.
> 
> Dere kan dele opp enkelte komponenter, som MovieViewer, for økt lesbarhet, da det kan bli ganske omfattende kode enkelte steder. 

<a id="html--css--typescript-beau2"></a>
**Reviewer Beau2:**

> Dere har en god bruk av HTML, CSS og Typescript. Dere viser til god forståelse f.eks ved at dere bruker <label> til FilterPanel og at SearchBar ligger i <form>.
> CSS deres er laget på en god måte, og dere har gjort den responsiv ved bruk av mobil-først med egne stilark per komponent.
> 
> Hvis jeg skulle pirke på noe så kunne dere i søkefelt, gi input en eksplisitt label \(kan være skjult\) eller aria-label, ikke stol på placeholder. Fordi uten en eksplisitt etikett kan skjermlesere annonsere feltet uklart, som fører til at brukere mister konteksten når placeholder forsvinner.

---

## Dokumentasjon

<a id="dokumentasjon-nina"></a>
**Reviewer Nina:**

> 
> 
> Dokumentasjonen gir inntrykk av å være veldig profesjonell og oversiktlig. Det er er en god  struktur og rød tråd som gjør det enkelt å lese. 
> Gjennomgående i dokumentasjonen er det godt bruk av standardisert språk, men enkelte avsnitt oppleves litt generiske og ordtunge.
> 
> Det er noe uklarhet i hvordan man setter opp API-en i prosjektet. Da linken til API-nøkkelen sender meg til en nettside der jeg får beskjed om at jeg "ikke har rettigheter til aksessere dette".  Dette gjør prosessen med å teste prosjektet lokalt noe knotete.
> Jeg kan lage en konto for nettsiden for å få en nøkkel for API-en. Dette burde vært bedre forklart i dokumentasjonen, slik at det ikke er noen tvil rundt hvordan få tak i autentisering.
> 
> Kan oppdatere med "Known Issues" som en egen fane, etter testing av nettsiden. Hvor man kan legge til for eksempel dette med Favorites + Sjanger.
> 

<a id="dokumentasjon-bob"></a>
**Reviewer Bob:**

> Dokumentasjonen er oversiktlig og får med det viktigste. Liker også at dere har med punkter over design beslutninger og rationale på hvorfor dere har tatt de ulike valgene.

<a id="dokumentasjon-ulrich"></a>
**Reviewer Ulrich:**

> Dokumentasjonen er svært omfattende, lesbar, oversiktlig, relevant og forståelig. Rett og slett imponerende. Den gir et helhetlig bilde av systemet, forklarer komplekse sammenhenger på en enkel måte og gjør det lett å sette seg inn i både arkitektur og detaljer.

<a id="dokumentasjon-alice"></a>
**Reviewer Alice:**

> README-filen er detaljert med installasjonsinstruksjoner, tekniske valg, arkitektur, testing og designbeslutninger. At dere reflekterer rundt API-strategi, state management, responsiv design og tilgjengelighet, gir god innsikt. Dokumentasjonen viser både hva og hvorfor.

<a id="dokumentasjon-felix13"></a>
**Reviewer Felix13:**

> Prosjektets dokumentasjon er godt skrevet og svært utfyllende. De har gode forklaringer på hvordan prosjektet skal settes opp og hvordan det skal kjøres. De forkarer om tech stack, funksjonalitet, tester, prosjekt struktur, api, bruk av AI osv. Jeg opplever inger store mangler i prosjektets dokumentasjon.

<a id="dokumentasjon-oscar"></a>
**Reviewer Oscar:**

> Dokumentasjonen deres er grundig og godt strukturert. Den gir en klar oversikt over funksjonalitet, tekniske valg og hvordan man setter opp prosjektet. Bruken av eksempler, kodeblokker og forklaringer gjør den lett å følge. Dere dekker både kursrelevans og tekniske aspekter som api, testing, arkitektur og responsiv design. 
> 
> Kanskje litt lang, men fortsatt oversiktlig, og fint at dere nevner deres bruk av AI med menneskelig kontroll. 

<a id="dokumentasjon-beau2"></a>
**Reviewer Beau2:**

> Dere har skrevet en veldig god og oversiktlig dokumentasjon med klare seksjoner som "Getting started", "Scripts" og "Project structure".
> Det er blitt brukt veldig bra dokumentasjon i henhold til testene deres, som gjorde det enklere å forstå og henge med i de. 
> Dere nevner videre bruken av KI, og alt i alt en veldig god dokumentasjon over prosjektet og nettsiden.

---

## Læringsutbytte

<a id="l-ringsutbytte-nina"></a>
**Reviewer Nina:**

> Det ser ut som gruppen har gjort en god innsats for å lage et solid og kravoppfyllende produkt.

<a id="l-ringsutbytte-bob"></a>
**Reviewer Bob:**

> Det her er lowkey ganske insane prosjekt ass 

<a id="l-ringsutbytte-ulrich"></a>
**Reviewer Ulrich:**

> Prosjektet demonstrerer en klar og solid forståelse for bruk av React, TypeScript, TanStack Query, API-integrasjoner og testing. Gruppens valg er godt begrunnet og dokumentert, og løsningen fungerer som forventet. Dette vitner om et høyt kompetansenivå og sterke ferdigheter.

---

## Responsivt design

<a id="responsivt-design-nina"></a>
**Reviewer Nina:**

> - Nettsiden fungerer godt på mobil og laptop, og jeg vil si kravet om responsivt har oppnåelse, på en god og gjennomtenkt måte.
> 
> - Siden viser tydelig hvor knapper og interaktive komponenter befinner seg. Noe som gjør det rask og effektivt å navigere seg rundt. Brukeren skjønner intuitivt hvor man skal trykke for de forskjellige funksjonene.
> 
> - Prosjektet er formet rundt mobile first prinsippet, som er bra for skalerbarheten underveis, og sørger for at siden fungerer på de fleste skjermer.
> 
> - Bruker grid og flex for å tilpasse innholdet, samt komponentene og knappene er utformet til å fungere på mobil, og mindre skjermer.
> 
> - Det kunne med fordel vært mulig å fjerne valgte filtre separat. Slik det er nå må man rydde alle filtre, dersom man vil fjerne ett enkelt
> 
> - På mobil fungerer nettsiden fint, med en liten endring i filterpanelet. Det forsvinner en mulighet for å gi minimum rating, men jeg ser ikke på dette som noe problem, da man fortsatt kan filtrere på rating. Dette gir mer grunnlag for å se på muligheten for at strengt tatt ikke trenger to filtre for rating generelt.

<a id="responsivt-design-bob"></a>
**Reviewer Bob:**

> En god løsning å ha to forskjellige versjoner som byttes mellom når man når en viss størrelse. Det funker bra med mer informasjon ved større skjermer og gir mening, samtidig som ved mindre skjermer/mobil er måten elementer er plassert på nedover intuitiv. Det *kunne* kanskje vært en idé å gjøre filter knappen mindre og feks sette den ved siden av search bare \(da må search baren bli mindre og\), men dette er egentlig mer pirk siden det ikke er noe særlig som kan gjøres bedre

<a id="responsivt-design-ulrich"></a>
**Reviewer Ulrich:**

> Hver komponent har sin egen CSS-fil, noe som gjør det enklere å tilpasse og teste responsiv oppførsel for ulike deler av grensesnittet.
> Bruk av <section>, <main>, <aside>, og <nav> gir fleksibilitet for tilpasning til ulike skjermstørrelser.
> Løsningen er lett tilgjengelig på både desktop og mobil
> Dere bruker rem som også er bra.
> Brukes @media queries for å passe på styling for mindre brede skjermer
> 

<a id="responsivt-design-alice"></a>
**Reviewer Alice:**

> Testing i ulike nettlesere og enheter er dokumentert, og layout og komponenter skalerer på en naturlig måte.

<a id="responsivt-design-felix13"></a>
**Reviewer Felix13:**

> Nettsiden er responsivt utformet og tilpasser seg forskjellige skjermstørrelser bra. 

<a id="responsivt-design-oscar"></a>
**Reviewer Oscar:**

> Dere har løst responsivt design godt med en tydelig mobile-first tilnærming og gjennomtenkte media queries for nettbrett og desktop. Layout, navigasjon og kortvisning tilpasser seg skjermstørrelsen, og dere ivaretar tilgjengelighet med skip-links og aria-attributter. 
> 
> Små forbedringer kunne vært bedre utnyttelse av plass på store skjermer.

<a id="responsivt-design-beau2"></a>
**Reviewer Beau2:**

> Nettsiden deres har et grensesnitt som tilpasser seg ulike skjermstørrelser på en svært god måte. Enten om jeg prøver å zoome inn på pc eller ved bruk av mobiltelefon.
> Jeg ser at dere har brukt flere style-sheets for ulike komponenter som skaper god fleksibilitet. Dette viser at det har vært bra fokus på responsivt design i nettsiden.
> 
> Forbedring:
> Jeg synes at filterbaren for rating er mye lettere og mer oversiktlig enn den i pc-skjerm. Revurder å implemintere den inn i grensesnittet til pc også.

---

## Utforming og stiling

<a id="utforming-og-stiling-nina"></a>
**Reviewer Nina:**

> - Siden er ryddig og ren. Jeg liker at brukeren trekkes mot hovedfunksjonen til nettsiden, ved å ha store klare bilder av filmene.
> 
> - Filterpanelet er rydddig satt opp og med et moderne inntrykk, som gjør at nettsiden fremstår meget profesjonell. Det er også veldig bra at filterpanelet bare kan bli værende "åpen" når man skal bruke nettsiden videre etter å ha åpnet panelet.
> 
> - Fint med placeholder bilder, når filmen ikke får det.
> 
> - Navigeringspilene kan med fordel bli flyttet til under den individuelle filmvisningen, og flytte listevalget rett under dette igjen. Ved å gjøre dette vil man gjøre interaksjonen mer fokusert på hver enkelt film. Det kan også klare opp rom for å kunne beskrive hva det er listevalget egentlig er basert på og gjør.
> 
> - Listen over filmer føles som noe en detalj som skal oppfylle et krav, i motsetning til resten av nettsiden. Det er ikke helt intuitivt for brukeren hva dette listevalget skal representere. Det ville hjulpet med å ha en prompt tilknyttet som forklarer hva listen inneholder. Slik det er nå vil en bruker som ikke har sett på nettsiden bare trykke på listen for å se hva som skjer.

<a id="utforming-og-stiling-bob"></a>
**Reviewer Bob:**

> Ryddig og oversiktlig. Å ikke bruke noe særlig farger funker veldig bra og funker bra med de stedene dere bruker farger, feks i tittelen på nettsiden. Størrelsene på fonts gir mening og gjør at vi trekkes mot de viktigste elementene, feks tittel på film, først og at mindre viktige elementer, feks utslippsdato, gis mindre oppmerksomhet. 

<a id="utforming-og-stiling-ulrich"></a>
**Reviewer Ulrich:**

> Appen ser veldig bra ut, dere har enkelt og ryddig design med lyse farger. Det er bra og intuitivt oppsett av knapper som gjør det enkelt å bruke appen. 
> Elementene på siden er satt opp uten unødvendige distraksjoner, alt har har en funksjon, noe jeg liker.
> 
> En ting jeg la merke til er at det er en dobbel krysnings \(X\) når man skal fjerne input i søkefeltet når feltet er i fokus. Utenom det er det ingenting jeg fant som virket feil. 
> Veldig bra jobba, fin app!
> 

<a id="utforming-og-stiling-alice"></a>
**Reviewer Alice:**

> Stilen er ren og minimalistisk med fokus på innholdet \(filmplakater og nøkkelinformasjon\). Bruk av variabler \(CSS custom properties\) og fallback for manglende bilder gir robusthet. Samtidig kunne man vurdert å bruke CSS-rammeverk \(f.eks. Tailwind\) for å forenkle vedlikehold, men valget av plain CSS gir tydelig læringsutbytte.

<a id="utforming-og-stiling-felix13"></a>
**Reviewer Felix13:**

> Designet på brukergrensesnittet er veldig bra! Det er ryddig og presentert på en oversiktlig måte. 

<a id="utforming-og-stiling-oscar"></a>
**Reviewer Oscar:**

> Applikasjonen er ryddig organisert med god separasjon mellom komponenter, hooks og services. Dokumentasjonen forklarer tekniske valg tydelig, og dere har løst det bra med responsivt design, tilgjengelighet og testing. Det gir et helhetsinntrykk som er gjennomtenkt og profesjonelt.

<a id="utforming-og-stiling-beau2"></a>
**Reviewer Beau2:**

> Nettsiden har en veldig ryddig utformig og oversiktlig grensesnitt.  Som nevnt i forrige tilbakemelding så har dere brukt flere style-sheets som bidrar til at det er mer oversiktlig of tydelig på hvilke komponenter som bruker hvilken styling.
> Videre så er en hver knapp tydelig plassert med gode kontraster når man hovrer over eller trykker på dem.
> 
> Forbedring:
> Når det kommer til dropdownene deres savner jeg litt mer detalj. Det er bra dere har med en pil i dem, men savner at den endrer form når man trykker på dem \(gå fra pil ned til sidestilt pil når man trykker\). Det er veldig bra at dere har implementert at man kan trykke på utsiden av dropdownene for å komme seg ut av dem, men jeg ser at dette ikke er gjort inne i popularity dropdownen.

---

## Web storage API

<a id="web-storage-api-nina"></a>
**Reviewer Nina:**

> - Overall god brukeropplevelse og ytelse på grunn av effektiv localStorage og sessionStorage
> 
> - Filtervalg og navigasjonsposisjon lagres i sessionStorage og i MovieViewer, slik at brukerens nåværende visning og søk gjenopprettes ved sideoppdatering, men ikke deles mellom faner. Dette gir en god balanse mellom persistens og isolasjon. Det kan derimot være ønskelig ved noen funksjoner å bruke storage-eventet til å oppdatere mellom faner. Som for eksempel tilegg av favoritter
> 
> - Lagrer søk i sessionstorage, så brukeren kan fortsette etter oppdatering 
> 
> 

<a id="web-storage-api-bob"></a>
**Reviewer Bob:**

> Både localstorage og session storage er brukt på en hensiktsmessig og effektiv måte for å lagre informasjon om blant annet brukerens filtreringer, søk og favorisering. Veldig bra 

<a id="web-storage-api-ulrich"></a>
**Reviewer Ulrich:**

> Søketerm lagres i sessionStorage i SearchBar.tsx, slik at brukerens søk huskes ved reload av siden i samme økt. Dette gir en bedre brukeropplevelse og oppfyller kravet om å huske valg.
> 
> Favorittvalg lagres i localStorage, slik at favoritter huskes selv om nettleseren lukkes og åpnes igjen. Dette er riktig bruk av localStorage.
> 
> Lagringslogikk er flyttet til en egen fil \(utils/localStorage.ts\), noe som gir god oversikt og gjør det enkelt å endre lagringsstrategi eller legge til flere funksjoner.

<a id="web-storage-api-alice"></a>
**Reviewer Alice:**

> Favoritter lagres i localStorage med cross-tab-synkronisering, og filtre lagres i sessionStorage. Dette gir en sømløs brukeropplevelse og viser avansert bruk av API-et.

<a id="web-storage-api-felix13"></a>
**Reviewer Felix13:**

> Gruppen bruker local storage for å lagre favoritt filmene til brukeren. Dette opplevde jeg som hensiktsmessig bruk at localstorage. Session storage blir derimot brukt for å lagre blant annet tidligere search terms noe jeg også opplever som hensiktsmessig. 

<a id="web-storage-api-oscar"></a>
**Reviewer Oscar:**

> Bra bruk av sessionStorage til søketerm, gir en god opplevelse uten å lagre unødvendig data mellom økter. LocalStorage til favoritter er effektivt løst med useSyncExternalStore, som gir både persistens og synking mellom faner. Totalt sett har dere brukt lagring som er godt tilpasset formålet. 

<a id="web-storage-api-beau2"></a>
**Reviewer Beau2:**

> Dere bruker local storage for å lagre favoritter og filterverdier, som gjør at dersom jeg refresher eller lukker siden så blir inputen min lagret. Veldig godt jobba :\)  

---

## Bruk av git

<a id="bruk-av-git-nina"></a>
**Reviewer Nina:**

> - Det har blitt brukt egne branches for å gjøre endringer, dette er meget bra og følger god utviklingsprosess-prinsipper.
> 
> - Det er relevante og gode issues som opprettes, og alle har blitt lukket. Samt at det ser ut som det har vært en naturlig progresjon i hvilke typer komponenter som opprettes.
> 
> - Burde knytte alle issues og pull requests sammen, slik at det er tydelig hvilke endringer som refereres til hvilke issues. Dette skaper tydelig historikk, dersom det skjer noe uventet.
> 
> - Ser også at det er noen relevante kommentarer av den som reviewer, det er bra. Forstår selv at det fort kan bli at man bare skriver noe tilfedlig for å få godkjent endringen \(da det er veldig mye forskjellig å sette seg inn i\), så godt at man også ser gjennom koden iblant og gir faktiske kommentarer.
> 
> 

<a id="bruk-av-git-bob"></a>
**Reviewer Bob:**

> Git er brukt på en veldig oversiktlig og konsekvent måte. Issues har en template med kriterier og krav som gjør det lett å holde styr på hva som må gjøres. Det er brukt feature branching og conventional commits med gode beskrivelser og navngivning som funker veldig bra! Det er kommentert på pull requests som viser at dere har hatt en diskusjon som har gjort at nettsiden har blitt forbedret.

<a id="bruk-av-git-ulrich"></a>
**Reviewer Ulrich:**

> Jeg ser at de har lagt issues og fulgt git commit konvensjoner.
> 
> Issues er skrevet veldig bra og tydlig og de fleste PRs har issues assosiert med seg.
> 
> Dere har aktivt brukt code reviews som også viser god utviklingsprosess.
> 
> Veldig bra!
> 
> 

<a id="bruk-av-git-alice"></a>
**Reviewer Alice:**

> Strukturert commit-historikk, feature branches og pull requests er nevnt. Bruk av linting og formattering sikrer ren historikk.

<a id="bruk-av-git-felix13"></a>
**Reviewer Felix13:**

> Med tanke på hvor mye kode dette prosjektet har så synes jeg det er kritikk verdig at det bare var 14 issues totalt. Mange av disse burde blitt delt opp i mindre issues slik at ikke alle pull requestene deres er på 2000 linjer. Dette gjør det vanskelig for folk å kunne gå gjennom i etterkant og godt forstå utviklingen av prosjektet PR til PR. I tillegg ser dere ut til å merge inn i main branch på hver pull request. Dette er ofte ansett som dårlig praksis. Her ville jeg anbefalt å ha en dev branch dere jobber på som periodisk blir merget inn i main. 

<a id="bruk-av-git-oscar"></a>
**Reviewer Oscar:**

> Ser ut som dere har hatt en ryddig arbeidsflyt med issues koblet til funksjonalitet og mange commits, som viser en jevn progresjon. Commit-meldingene er stort sett beskrivende og issues er godt organisert i mindre oppgaver, som tyder på at dere har hatt en strukturert utviklingsprosess. 

<a id="bruk-av-git-beau2"></a>
**Reviewer Beau2:**

> Dere har hatt en veldig god bruk av git!
> 
> Commits:
> Meldingene under commitsene deres er veldig konkrete og det er lett å forstå hva og hvor ting blir gjort. 
> Dere har også en veldig god og konsekvent bruk av konvensjone \(f.eks. feat: enhance UI..., fix: update placeholder image path\). 
> 
> Issues:
> Dere har en veldig fin struktur av issues hvor dere også har klart å få med om det er API, UI eller feature det er som hører til den spesifikke issuen. 
> Videre så har dere hatt en god måte å fordele ansvaret rundt om i gruppa allerede inn i issues. Dette er god praksis som gjør det enkelt allerede fra start å vite hvem som fikser hva.
> 
> Alt i alt har dere en veldig god flyt ved bruk av git som samarbeidsverktøy.
> 

---

## Utforming og interaksjon

<a id="utforming-og-interaksjon-nina"></a>
**Reviewer Nina:**

> - Brukeren får representert en ressurs om gangen. Det er tydelig og enkelt å se at man kan navigere med piltastene. 
> 
> - Listen der man kan velge filmer fungerer, men det er noe usikkert for brukeren hva den skal gjøre og hvorfor den er der. Det ender opp med at brukeren må trykke seg inn på den for å finne ut hva den gjør.
> 
> - Filtreringsfunksjonen på nettsiden er veldig godt presentert og detaljert. Som bruker kan man velge de mest relevante filtrerings- og sorteringsvalgene. Det kunne med fordel vært lagt inn en knapp som lukker filtreringsvinduet. Det er ikke helt intuitivt å måtte trykke på filter knappen igjen for å lukke. Det er tilgjengjeld fint å bare ha filterpanelet åpent, så det kunne vært bakt inn på en eller annen måte slik, i stedet for å ha det som et pop up vindu.
> 
> - Det er tydelig hvordan man legger til en favoritt, samt at knappen for å filtrere basert på favoritter skiller seg ut fra de andre valgene. Dette gjør det raskt og effektivt å finne sine favoritter. Fint at favoritter lagres mellom sessions.
> 
> - Når man velger en favoritt, sammen med filtrering får man en feilmelding - Uncaught TypeError: can't access property "includes", j.genre_ids is undefined
> \(Kommenterer dette videre under kodedelen.\). Denne feilen stanser hele brukeropplevelsen. Skjermen blir hvit og man må lukke hele vinduet for så å starte nettsiden igjen.

<a id="utforming-og-interaksjon-bob"></a>
**Reviewer Bob:**

> Dere treffer alle kravene for utforming og interaksjon. Det er intuitivt hvordan man interagerer med nettsiden, særlig er filtreringen ryddig og simpel. Man kan enkelt bla gjennom filmene og å kunne bruke piltaster var en god løsning \(i tillegg til at man kan trykke selvfølgelig\).

<a id="utforming-og-interaksjon-ulrich"></a>
**Reviewer Ulrich:**

> Komponentene MovieCard.tsx og MovieViewer.tsx.. dere viser en film om gangen, med dedikerte visningskomponenter. Dette oppfyller kravet om å presentere en ressurs om gangen.
> 
> MovieViewer.tsx med funksjonalitet for å bla mellom filmer prev og next også
> 
> FilterPanel.tsx og useFilters.ts gjør at brukeren kan filtrere eller sortere utvalget. At filterlogikken er lagt i en egen hook gir god oversikt og gjenbrukbarhet.
> 
> useFavorites.ts og utils/localStorage.ts viser at dere har implementert favorittvalg og lagring i web storage, slik at valg huskes ved reload og mellom økter.
> 
> Veldig bra!

<a id="utforming-og-interaksjon-alice"></a>
**Reviewer Alice:**

> Appen fremstår gjennomtenkt med intuitiv navigasjon \(carousel, søk, filterpanel og favorittsystem\). Bruken av tastaturnavigasjon, skip-links og ARIA gjør at interaksjonen fungerer godt for ulike brukergrupper. Interaksjonsmønstrene er gjenkjennelige \(Netflix/Disney+ stil\) og brukervennlige.

<a id="utforming-og-interaksjon-felix13"></a>
**Reviewer Felix13:**

> På nettsiden kan man lett hoppe frem og tilbake mellom filmer og kan søke opp filmer en ønsker å finne ut mer om. I tillegg kan man legge til filmer i favoritt kategorien sin. Brukeren har også muligheten til å filtrere basert på forskjellige ting f.eks utgivelsesår\(dog bare tilbake til 2022 selv om det er mulig å søke opp eldre filmer\), popularitet, sjanger og egne favoritter. Alt dette blir presentert ryddig og oversiktlig.

<a id="utforming-og-interaksjon-oscar"></a>
**Reviewer Oscar:**

> Dere har løst kravene godt ved å bruke semantiske elementer, tilgjengelighetsattributter og et oversiktlig design som gjør ressursene enkle å finne og filtrere. Interaksjonen med søk, filtrering og favoritter er intuitiv og støttes av tastaturnavigasjon og skjermleser-støtte. 

<a id="utforming-og-interaksjon-beau2"></a>
**Reviewer Beau2:**

> Jeg synes gruppa har lagd frem en ryddig og oversiktlig struktur. Ressursene er presentert gjennom tydelige komponenter som søkefeltet, filterering og filmkort, som gir en god og intuitiv opplevelse. Spesielt er muligheten til å favorisere for så å bruke det i filtreringen en veldig god implementasjon, som fungerer etter refreshing.
> 
> Forbedring: 
> I filterpanelet så har man ikke anledning til å velge andre årstall enn 2022, 2024 og 2025. Jeg klarer fremdeles å finne filmer utenfor disse årstallene, men de vil da ikke kunne bli filtrert ut fra panelet. I tillegg kan dere til videre implementering legge til "til og fra" årstall for å f.eks få filmer fra dette året og oppover samt motsatt.
> 
> Siden klarer å huske alle filtrene mine dersom jeg refresher siden som er bra, men den tar meg tilbake til den første filmen i listen som har blitt presentert etter filtrering.

---

## React

<a id="react-nina"></a>
**Reviewer Nina:**

> - Nettsiden viser god bruk av React, med state, props og hooks. Samt god struktur. 
> 
> - Komponenter rendres på en ryddig måte. Bra at "SearchBar" bruker debounce slik at unødige API-kall unngås. Dette gjør at opplevelsen av søkemotoren er rask og effektiv i bruk.
> 
> - Veldig ryddig struktur og god organisering i egne mapper. Det gjør importene tydelige, koden enkel å navigere og filene intuitivt plassert for mer effektivt arbeid.
>     
>     
> Dataflyt/props
> - Bra at App henter data og sender kun movies videre til `MovieViewer`. Det gir en ryddig separasjon mellom datahenting og presentasjon. `FilterPanel` får presise props \(f.eks. `filters`, `setFilters`\), slik at panelet kan fokusere kun på UI og ikke på hvor data kommer fra.
>     
> Hooks
> - useQuery håndterer loading og error på en ryddig måte i App. Egne hooks \(useDebounce, useFavorites\) samler logikk og gjør komponentene enklere.
>     
> - \(Omtalt under kode: Feilen ved kombinasjon av favoritt + sjanger er adressert annet sted, så jeg lar den ligge her.\)
> 

<a id="react-bob"></a>
**Reviewer Bob:**

> Det er laget hooks som gjør koden mer ryddig og bidrar til at man enkelt kan legge til funksjonalitet på ulike komponenter. State og effect er hyppig brukt for å endre søk, filtrering og visning av ulike filmer. Props blir også brukt der det gir mening og det er ikke overforbruk av noen funksjonaliteter som kommer med react.

<a id="react-ulrich"></a>
**Reviewer Ulrich:**

> Komponentens state \(input\) håndteres med useState, og props er tydelig typet med et eget interface. Props som onSearch, onTyping, og onSelectSuggestion gir god fleksibilitet og gjør komponenten gjenbrukbar.
> 
> Bruk av custom hook \(useDebounce\) for å kontrollere søk gir bedre ytelse og brukeropplevelse. useRef brukes riktig for å holde styr på forrige søketerm.
> 
> useEffect brukes til å trigge søk og lagre søketerm i sessionStorage, noe som gir god kontroll over sideeffekter.
> 
> Komponentene er organisert i egne filer, og CSS er delt opp per komponent. Dette gir god oversikt og modularitet.
> 
> Komponentene er skrevet som funksjonelle komponenter, som er moderne og anbefalt praksis i React.

<a id="react-alice"></a>
**Reviewer Alice:**

> Bruk av funksjonelle komponenter, custom hooks \(useFilters, useFavorites, useDebounce, useFocusTrap\) og React Query gir en moderne og modulær arkitektur. Komponentene er gjenbrukbare, og det er en bevisst separasjon av logikk og presentasjon.

<a id="react-felix13"></a>
**Reviewer Felix13:**

> Gruppen bruker hyppig props, noe som bidrar til bra typesikkerhet. Vider blir det også hyppig brukt react hooks som useEffect og useState. Filene er også veldig godt organisert i et tydelig mappe hierarki. 

<a id="react-oscar"></a>
**Reviewer Oscar:**

> Gjennomført bruk av react. State og props er brukt på en ryddig måte for å gjøre komponentene gjenbrukbare, og hooks er godt utnyttet \(både egne og innebygde\). Dette gir bedre struktur og testbarhet. Filorganiseringen følger best practice, og gjør prosjektet deres lett å navigere i. 

<a id="react-beau2"></a>
**Reviewer Beau2:**

> Jeg synes nettsiden har en tydelig struktur av komponenter og seperasjon av ansvar som hooks, services og types. Det er brukt en fornuftig state-håndtering med lokal UI-state og felles logikk i egne hooks \(useDebounce\).

---

## Generell vurdering av løsninger

<a id="generell-vurdering-av-l-sninger-ulrich"></a>
**Reviewer Ulrich:**

> Jeg opplever at prosjektet innfrir alle kravene i oppgaven på en strukturert og ryddig måte. Etter min vurdering holder både den overordnede strukturen, kodekvaliteten, dokumentasjonen og appens presentasjon et høyt nivå i tråd med de fastsatte kriteriene.
> 
> 
> 
> 
> 

<a id="generell-vurdering-av-l-sninger-felix13"></a>
**Reviewer Felix13:**

> Kul app, fint design, tidvis litt store filer jeg tror kunne blitt delt opp og litt få issues som fører til unødvendig store pull requests. 
> 
> Alt i alt veldig bra laget. 

---

## Testing

<a id="testing-nina"></a>
**Reviewer Nina:**

> - Prosjektet har god testing og følger prinsipper for god testing. Bruk av snapshot tester på de store komponentene er bra. 
> 
> - Godt å se i dokumentasjonen at testingen beskrives og utdypes.
> 
> - Det er uheldig at sjanger-id buggen har klart å komme seg gjennom testingen. Det kunne kanskje også vært mulig å hatt en liten økt der man fysisk på nettsiden forsøker å "ødelegge" den. For å se hvor robust den egentlig er. 
> 
> - API mockes slik at man unngår unødvendige kall
> 

<a id="testing-bob"></a>
**Reviewer Bob:**

> Det er skrevet tester til alle komponenter og hooks \(med unntak av useFocusTrap\) som dekker det meste at funksjonaliteten. Mocking er brukt der det gjøres API kall. Det testes blant annet om filtreringen viser riktig elementer underveis som state endres, og om siden viser riktig film etter API-kall ved bruk av mocked filmer. Snapshot er brukt for å teste om komponenter endres fra gang til gang noe som gjør det lett å se om det har skjedd uønskede endringer. Bra!

<a id="testing-ulrich"></a>
**Reviewer Ulrich:**

> Det finnes dedikerte testfiler for hver komponent og hook. Testene dekker props, state, og brukerinteraksjon, noe som gir trygghet for at komponentene fungerer som forventet.
> Testene for hooks og komponenter mocker API-kall, bra!
> Egen testing av hooks som useDebounce, useFavorites, og useFilters viser at logikken bak brukerinteraksjon og lagring er testet isolert.
> 
> Prosjektet har egne snapshot-filer for alle hovedkomponenter \(App, FilterPanel, MovieCard, MovieViewer, SearchBar\). Dette gir god dekning av visuell endring og hjelper med å fange utilsiktede endringer i UI.
> 
> Samsvarer med min utprøving.

<a id="testing-alice"></a>
**Reviewer Alice:**

> Bruk av Vitest og React Testing Library gir både enhetstesting og integrasjonstesting. Også lagring \(localStorage/sessionStorage\) er testet, noe mange prosjekter overser.

<a id="testing-felix13"></a>
**Reviewer Felix13:**

> Prosjektet bruker vitest og har snapshot-tester og benytter seg av mocking av data.  Gruppen har laget både vanlige tester og snapshot tester for alle komponentene sine\(med unntak av useFocusTrap ser det ut som\). Dette er svert bra testdekningsgrad og legger til grunnen for god testdrevet utvikling. 

<a id="testing-oscar"></a>
**Reviewer Oscar:**

> Testene er grundige og dekker flere viktige aspekter. Dere bruker snapshots for å verifisere komponentenes utseende i ulike tilstander, og dere har mange eksempler på komponenttesting med testing-library fra react og vitest. Det er bra bruk av mocking for å unngå faktiske rest API-kall, noe som gir stabile og raske tester. Responsivt design er nevnt i README. Ellers samsvarer testene med min egen utprøving. 

<a id="testing-beau2"></a>
**Reviewer Beau2:**

> Dere har laget gode tester. Det dekker kravet, og spesielt god bruk av Mocking og Snapshots.

---


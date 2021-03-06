export const cardNames = {
  pubHist: 'Publication history',
  peer: 'Peer review',
  clinical: 'Linked clinical trials',
  update: 'Status update',
  copyright: 'Copyright & licensing',
  supp: 'Supplementary material',
  other: 'Other'
}

export const cardNamesArray = do {
  let cardNamesArray = []
  for(let name in cardNames) {
    cardNamesArray.push(cardNames[name])
  }
  cardNamesArray
}

const {pubHist, peer, clinical, update, copyright, supp, other} = cardNames


export const crossmarkErrors = [
  `${pubHist} label`,

  `${peer} label`,
  `${peer} href`,

  `${copyright} label`,
  `${copyright} href`,

  `${other} label`,
  `${other} href`,

  `${supp} href`,

  `${update} type`,
  `${update} doi`,
  `${update} doiInvalid`,
  `${update} doiNotExist`,
  `${update} date`,

  `${clinical} registry`,
  `${clinical} trialNumber`
]


export function parseCrossmark (data) {
  const reduxForm = {};
  const showCards = {};

  if(data.updates) {
    reduxForm[update] = {};
    if(!Array.isArray(data.updates.update)) data.updates.update = [data.updates.update];

    showCards[update] = parseInt(data.updates.update.length);

    data.updates.update.forEach((thisUpdate, i)=>{
      let doi = '', year = '', month = '', day = '';
      if(typeof thisUpdate === 'string') doi = thisUpdate;
      if (thisUpdate['-date']) {
        [year, month, day] = thisUpdate['-date'].split('-')
      }
      reduxForm[update][i] = {
        type: upperCaseFirst(thisUpdate['-type']),
        doi: thisUpdate['#text'] || doi || '',
        year, month, day
      }
    });
  }

  if(data.custom_metadata && data.custom_metadata.assertion) {
    if(!Array.isArray(data.custom_metadata.assertion)) data.custom_metadata.assertion = [data.custom_metadata.assertion];

    data.custom_metadata.assertion.forEach((assertion)=>{

      function parseAttributes (card) {
        const i = assertion['-order'];
        showCards[card] = parseInt(i) + 1;
        reduxForm[card] = reduxForm[card] ? reduxForm[card] : {};
        reduxForm[card][i] = {};

        for (let key in assertion) {
          if(key==='-href' && !assertion[key] ){
            assertion[key]='http://'
          }
          reduxForm[card][i][key.slice(1)] = assertion[key] || '';
        }
      }

      if(assertion['-group_name'] === 'publication_history') {
        const i = assertion['-order'];
        showCards[pubHist] = parseInt(i) + 1;

        reduxForm[pubHist] = reduxForm[pubHist] || {};
        const [ year, month, day ] = assertion['#text'] ? assertion['#text'].split('-') : ['','',''];
        reduxForm[pubHist][i] = {
          label: assertion['-label'] || '',
          year, month, day
        }
      }
      else if (assertion['-group_name'] === 'peer_review') {
        parseAttributes(peer)
      }
      else if (assertion['-group_name'] === 'copyright_licensing') {
        parseAttributes(copyright)
      }
      else if (assertion['-name'] === 'supplementary_Material') {
        parseAttributes(supp)
      } else {
        parseAttributes(other)
      }
    })
  }

  if(data.custom_metadata && data.custom_metadata['ct:program'] && data.custom_metadata['ct:program']['ct:clinical-trial-number']) {
    let ctn = data.custom_metadata['ct:program']['ct:clinical-trial-number']

    if(!Array.isArray(ctn)) {
      ctn = [ctn];
    }

    showCards[clinical] = parseInt(ctn.length);
    reduxForm[clinical] = {};

    ctn.forEach((eachClinical, i)=>{
      reduxForm[clinical][i] = {};
      for (let key in eachClinical) {
        const slicedKey = key.slice(1);
        if(slicedKey === 'text') {
          reduxForm[clinical][i]['trialNumber'] = eachClinical[key] || '';
        }
        else if (slicedKey === 'registry') {
          reduxForm[clinical][i][slicedKey] = swappedRegistry[eachClinical[key]] || '';
        }
        else if (slicedKey === 'type'){
          reduxForm[clinical][i][slicedKey] = relationships[eachClinical[key]] || ''
        }
      }
    })
  }

  return {reduxForm, showCards}
}


export const registryDois = {
  'Uniform Trial Number': '10.18810/utn',
  'ClinicalTrials.gov': '10.18810/clinical-trials-gov',
  'ISRCTN.org': '10.18810/isrctn',
  'Australian New Zealand Clinical Trials Registry': '10.18810/anzctr',
  'German Clinical Trials Register': '10.18810/drks',
  'Chinese Clinical Trial Registry': '10.18810/chictr',
  'Brazilian Clinical Trials Registry': '10.18810/rebec',
  'Netherlands National Trial Register': '10.18810/dutch-trial-register',
  'Clinical Trials Registry India': '10.18810/clinical-trial-registry-india',
  'UMIN Japan': '10.18810/umin-japan',
  'Pan African Clinical Trial Registry': '10.18810/pactr',
  'Sri Lanka Clinical Trials Registry': '10.18810/slctr',
  'Japan Medical Association Clinical Trial Registry': '10.18810/jma',
  'Iranian Registry of Clinical Trials': '10.18810/irct',
  'Clinical Research Information Service, Republic of Korea': '10.18810/cris',
  'Cuban Public Registry of Clinical Trials': '10.18810/rpec',
  'EU Clinical Trials Register': '10.18810/euctr',
  'Japan Primary Registries Network': '10.18810/jprn',
  'Thai Clinical Trials Registry': '10.18810/tctr'
}

const swappedRegistry = swap(registryDois);

const relationships = {
  'preResults': 'Pre-Results',
  'results': 'Results',
  'postResults': 'Post-Results'
}

export const updateTypes = ['Addendum','Clarification','Correction','Corrigendum','Erratum','Expression Of Concern','New Edition','New Version','Partial Retraction','Removal','Retraction','Withdrawal']

function swap(object){
  var ret = {};
  for(var key in object){
    ret[object[key]] = key;
  }
  return ret;
}

function upperCaseFirst (string) {
  if(!string) return '';
  return string.split('_').map((string)=>string.charAt(0).toUpperCase() + string.slice(1)).join(' ')
}
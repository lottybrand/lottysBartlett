from dallinger.nodes import Source


class QuizSource(Source):
    """A Source that reads in a question from a file and transmits it."""

    __mapper_args__ = {
        "polymorphic_identity": "quiz_source"
    }

    def _contents(self):
        """Define the contents of new Infos .... (New transmissions??)

        transmit() -> _what() -> create_information() -> _contents().
        """
        number_transmissions = len(self.infos())
        import json
        questions = [
            json.dumps({
                'question': 'In which country is the red dot located?',
                'number':1,
                'round': 1,
                'topic': 'Geography',
                'Wwer': 'Guatemala',
                'Rwer': 'Belize',
                'pic': True, 
                }),
            json.dumps({
                'question': 'In which city is the red dot located?',
                'number':2,
                'round':1,
                'topic': 'Geography',
                'Wwer': 'Nigeria',
                'Rwer': 'The Ivory Coast',
                'pic': True, 
                }),
            json.dumps({
                'question': 'The capital of Hawaii is',
                'number':3,
                'round':1,
                'topic': 'Geography',
                'Wwer': 'Waikiki',
                'Rwer': 'Honolulu',
                'pic': False, 
                }),
            json.dumps({
                'question': 'Saint Helena is an island in',
                'number':4,
                'round':1,
                'topic':'Georgraphy',
                'Wwer': 'The Indian Ocean',
                'Rwer': 'The South Atlantic Ocean',
                'pic': False,
                }),
            json.dumps({
                'question': 'Which country shares a border with El Salvador?',
                'number':5,
                'round':1,
                'topic':'Georgraphy',
                'Wwer': 'Paraguay',
                'Rwer': 'Honduras',
                'pic': False,
                }),
            json.dumps({
                'question': 'The capital of the Philippines is?',
                'number':6,
                'round':1,
                'topic':'Georgraphy',
                'Wwer': 'Davao',
                'Rwer': 'Manila',
                'pic': False,
                }),
            json.dumps({
                'question': 'Which is closest to Finland?',
                'number':7,
                'round':1,
                'topic':'Georgraphy',
                'Wwer': 'Moscow',
                'Rwer': 'St Petersburg',
                'pic': False,
                }),
            json.dumps({
                'question': 'Which is the largest of The Canary Islands?',
                'number':8,
                'round':1,
                'topic':'Georgraphy',
                'Wwer': 'Gran Canaria',
                'Rwer': 'Tenerife',
                'pic': False,
                }),
            json.dumps({
                'question': 'Oklahoma state shares a border with?',
                'number':9,
                'round':1,
                'topic':'Georgraphy',
                'Wwer': 'Arizona',
                'Rwer': 'New Mexico',
                'pic': False,
                }),
            json.dumps({
                'question': 'Amsterdam is nearer to?',
                'number':10,
                'round':1,
                'topic':'Georgraphy',
                'Wwer': 'Antwerp',
                'Rwer': 'Rotterdam',
                'pic': False,
                }),
            json.dumps({
                'question': 'A pot of nail varnish weighs?',
                'number':11,
                'round':2,
                'topic':'Weight estimation',
                'Wwer': '162g',
                'Rwer': '62g',
                'pic': False,
                }),
            json.dumps({
                'question': 'A Rubik<q>s cube weighs?',
                'number':12,
                'round': 2,
                'topic': 'Weight',
                'Wwer': '1.4kg',
                'Rwer': '0.14kg',
                'pic': False,
                }),
            json.dumps({
                'question': 'A blue whale weighs?',
                'number':13,
                'round': 2,
                'topic': 'Weight',
                'Wwer': '1,400kg',
                'Rwer': '140,000kg',
                'pic': False,
                }),
            json.dumps({
                'question': 'A tennis ball weighs?',
                'number':14,
                'round': 2,
                'topic': 'Weight',
                'Wwer': '5.85g',
                'Rwer': '58.5g',
                'pic': False,
                }),
            json.dumps({
                'question': 'Which weighs more?',
                'number':15,
                'round': 2,
                'topic': 'Weight',
                'Wwer': 'An average wood pigeon',
                'Rwer': 'An average seagull',
                'pic': False,
                }),
            json.dumps({
                'question': 'A Boeing 747 (on take-off) weighs?',
                'number':16,
                'round': 2,
                'topic': 'Weight',
                'Wwer': '40,000kg',
                'Rwer': '400,000kg',
                'pic': False,
                }),
            json.dumps({
                'question': 'A skateboard weighs?',
                'number':17,
                'round': 2,
                'topic': 'Weight',
                'Wwer': '34kg',
                'Rwer': '3.4kg',
                'pic': False,
                }),
            json.dumps({
                'question': 'A newborn baby weighs?',
                'number':18,
                'round': 2,
                'topic': 'Weight',
                'Wwer': '34kg',
                'Rwer': '3.5kg',
                'pic': False,
                }),
            json.dumps({
                'question': 'A female giraffe weighs?',
                'number':19,
                'round': 2,
                'topic': 'Weight',
                'Wwer': '83kg',
                'Rwer': '830kg',
                'pic': False,
                }),
            json.dumps({
                'question': 'Which weighs more?',
                'number':20,
                'round': 2,
                'topic': 'Weight',
                'Wwer': 'The London Eye',
                'Rwer': 'The Eiffel Tower',
                'pic': False,
                })
        ]
        number_transmissions = len([i for i in self.infos() if i.contents not in ["Bad Luck", "Good Luck"]])
        if number_transmissions < len(questions):
            question = questions[number_transmissions]
        else:
            question = questions[-1]
        return question
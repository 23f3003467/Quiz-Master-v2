export default {
    name: 'TakeQuizModal',
    props: ['quizId', 'show'],
    template: `
      <div v-if="show" class="modal fade show d-block" tabindex="-1" role="dialog" style="background-color: rgba(0,0,0,0.8); z-index: 1050;">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content p-4" style="min-height: 100vh;">
            <div v-if="loading" class="text-center">
              <h5>Loading Quiz...</h5>
            </div>
            <div v-else>
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5>{{ quiz?.title }}</h5>
                <div><strong>Time Left:</strong> {{ minutes }}:{{ seconds < 10 ? '0' + seconds : seconds }}</div>
              </div>
  
              <div v-if="currentQuestion">
                <h6>Question {{ currentIndex + 1 }} of {{ quiz.questions.length }}</h6>
                <p class="my-3">{{ currentQuestion.question_statement }}</p>
  
                <div class="form-check mb-2" v-for="n in 4" :key="n">
                  <input class="form-check-input" type="radio" :id="'opt' + n"
                         :value="n" v-model="answers[currentQuestion.id]" />
                  <label class="form-check-label" :for="'opt' + n">
                    {{ currentQuestion['option' + n] }}
                  </label>
                </div>
  
                <div class="mt-4 text-end">
                  <button class="btn btn-secondary me-2" @click="prevQuestion" :disabled="currentIndex === 0">Previous</button>
                  <button class="btn btn-primary me-2" @click="nextQuestion" :disabled="currentIndex === quiz.questions.length - 1">Save & Next</button>
                  <button class="btn btn-danger" @click="submit(false)">Submit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        quiz: null,
        answers: {},
        // using index to track current question
        currentIndex: 0,
        // timer variables
        // minutes and seconds for countdown
        minutes: 0,
        seconds: 0,
        timer: null,
        loading: false
      };
    },
    computed: {
      currentQuestion() {
        if (this.quiz) {
          return this.quiz.questions[this.currentIndex];
        } else {
          return undefined;
        }
        
      }
    },
    watch: {
      show(newVal) {
        if (newVal && this.quizId) {
          this.fetchQuiz();
        }
      }
    },
    methods: {
      async fetchQuiz() {
        this.loading = true;
        const res = await fetch(`/api/quizzes/${this.quizId}/attempt`, {
          headers: {
            'Authentication-Token': localStorage.getItem('auth_token')
          }
        });
        const data = await res.json();
        this.quiz = data;
        this.answers = {};
        this.minutes = this.getTotalMinutes(data.time_duration);
        this.seconds = 0;
        this.startTimer();
        this.loading = false;
      },
      getTotalMinutes(duration) {
        const [hh, mm] = duration.split(':').map(Number);
        return hh * 60 + mm;
      },
      startTimer() {
        clearInterval(this.timer);
        this.timer = setInterval(() => {
          if (this.minutes === 0 && this.seconds === 0) {
            this.submit(true);
          } else if (this.seconds === 0) {
            this.minutes--;
            this.seconds = 59;
          } else {
            this.seconds--;
          }
        }, 1000);
      },
      prevQuestion() {
        if (this.currentIndex > 0) this.currentIndex--;
      },
      nextQuestion() {
        if (this.currentIndex < this.quiz.questions.length - 1) this.currentIndex++;
      },
      async submit(auto = false) {
        clearInterval(this.timer);
        const durationTaken = this.getTotalMinutes(this.quiz.time_duration) * 60 - (this.minutes * 60 + this.seconds);
  
        const res = await fetch(`/api/quizzes/${this.quizId}/attempt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth_token')
          },
          body: JSON.stringify({
            answers: this.answers,
            duration_taken: durationTaken
          })
        });
  
        const result = await res.json();
  
        if (res.ok) {
          alert(auto ? '⏳ Time up! Quiz auto-submitted.' : '✅ Quiz submitted!');
          this.$emit('submitted', result);
          this.$emit('close');
        } else {
          alert(result.message || '❌ Submission failed');
          this.$emit('close');
        }
      }
    },
    
  };
  
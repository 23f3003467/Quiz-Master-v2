export default {
    name: 'EditQuestionModal',
    props: ['show', 'question'],
    data() {
      return {
        localQuestion: {
          id: null,
          question_statement: '',
          option1: '',
          option2: '',
          option3: '',
          option4: '',
          correct_option: 1
        }
      };
    },
    watch: {
      question: {
        immediate: true,
        handler(newVal) {
          this.localQuestion = { ...newVal };
          // console.log(this.localQuestion);
        }
      }
    },
    template: `
      <div v-if="show">
        <div class="modal fade show d-block" tabindex="-1" role="dialog" style="background-color: rgba(0,0,0,0.5);">
          <div class="modal-dialog" role="document">
            <div class="modal-content p-3">
              <h5 class="modal-title">Edit Question</h5>
              <textarea v-model="localQuestion.question_statement" class="form-control mb-2" placeholder="Question text"></textarea>
              <input v-model="localQuestion.option1" class="form-control mb-2" placeholder="Option 1" />
              <input v-model="localQuestion.option2" class="form-control mb-2" placeholder="Option 2" />
              <input v-model="localQuestion.option3" class="form-control mb-2" placeholder="Option 3" />
              <input v-model="localQuestion.option4" class="form-control mb-2" placeholder="Option 4" />
              <input v-model.number="localQuestion.correct_option" class="form-control mb-2" placeholder="Correct Option (1-4)" />
              <div class="text-end">
                <button class="btn btn-success me-2" @click="submit">Update</button>
                <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    methods: {
      async submit() {
        const res = await fetch(`/api/questions/${this.localQuestion.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth_token')
          },
          body: JSON.stringify(this.localQuestion)
        });
        if (res.ok) {
          this.$emit('success');
          this.$emit('close');
        } else {
          alert('Failed to update question');
        }
      }
    }
  };
  
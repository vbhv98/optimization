from flask import Flask, render_template, request, jsonify

from greedy import greedy_algorithm

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/getresult', methods=['POST'])
def get_results():
    data = request.get_json(force=True)
    data['length'] = int(data['length'])
    print(data)
    return jsonify(str(greedy_algorithm(data['array'], data['length'])))


if __name__ == "__main__":
    app.run(debug=True)

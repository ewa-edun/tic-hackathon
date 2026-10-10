from flask import Flask, jsonify, request
from flask_cors import CORS
from data import PRODUCTS, ORDERS
import datetime

app = Flask(__name__)
CORS(app)

@app.route('/api/products', methods=['GET'])
def get_products():
    return jsonify(PRODUCTS)

@app.route('/api/orders', methods=['GET'])
def get_orders():
    return jsonify(ORDERS)

@app.route('/api/orders', methods=['POST'])
def create_order():
    payload = request.get_json()
    if not payload or 'items' not in payload or 'buyerName' not in payload or 'shippingAddress' not in payload:
        return jsonify({'error': 'invalid payload'}), 400

    new_orders = []
    for item in payload['items']:
        order = {
            'id': f"ORD-{int(datetime.datetime.utcnow().timestamp()) % 100000}",
            'productTitle': item.get('title') or item.get('productTitle'),
            'quantity': item.get('qty', 1),
            'total': float(item.get('price', 0)) * int(item.get('qty', 1)),
            'status': 'Processing',
            'buyerName': payload['buyerName'],
            'date': datetime.datetime.utcnow().strftime('%Y-%m-%d'),
            'shippingAddress': payload['shippingAddress']
        }
        ORDERS.insert(0, order)
        new_orders.append(order)

    return jsonify(new_orders), 201

if __name__ == '__main__':
    app.run(debug=True, port=5001)

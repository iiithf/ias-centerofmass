#!/usr/bin/env python3
from sklearn.model_selection import train_test_split
import tensorflow as tf
import numpy as np


INPUTS = 100
RATE = 0.1
EPOCHS = 200


def com(row):
  m, mx, my = (0, 0, 0)
  for i in range(0, len(row), 3):
    m += row[i]
    mx += row[i]*row[i+1]
    my += row[i]*row[i+2]
  if m==0: return (-1, -1)
  return (mx/m, my/m)

def data_generate(count=10000, test=0.2):
  x, y = ([], [])
  for i in range(count):
    x.append(np.random.rand(INPUTS*3))
    y.append(com(x[i]))
  return train_test_split(x, y, test_size=test)

def ann_layer(x, size, name=None):
  w = tf.Variable(tf.truncated_normal(size))
  b = tf.Variable(tf.truncated_normal(size[-1:]))
  return tf.add(tf.matmul(x, w), b, name)

def ann_network(x):
  h1 = tf.nn.relu(ann_layer(x, [INPUTS*3, INPUTS]))
  h2 = tf.nn.sigmoid(ann_layer(h1, [INPUTS, INPUTS]))
  h3 = tf.nn.sigmoid(ann_layer(h2, [INPUTS, 30]))
  return ann_layer(h3, [30, 2])


print('generating dataset:')
train_x, test_x, train_y, test_y = data_generate()
print('%d train rows, %d test rows' % (len(train_x), len(test_x)))

print('\ndefining ann:')
x = tf.placeholder(tf.float32, [None, INPUTS*3])
y_ = tf.placeholder(tf.float32, [None, 2])
y = ann_network(x)
cost = tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(logits=y, labels=y_))
train = tf.train.GradientDescentOptimizer(RATE).minimize(cost)

print('\nstarting training:')
sess = tf.Session()
sess.run(tf.global_variables_initializer())
for epoch in range(EPOCHS):
  sess.run(train, {'x': train_x, 'y_': train_y})
  accuracy = sess.run(tf.reduce_mean(y-y_), {x: train_x, y_: train_y})
  print('Epoch %d: %f accuracy' % (epoch, accuracy))


import { useState } from 'react'
import { Button, Card, Form } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext.jsx'

export default function Login() {
  const [email, setEmail] = useState('admin@turf.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card">
        <Card.Body>
          <h2 className="text-center mb-2 fw-bold display-6">Turf.</h2>
          <p className="text-center text-muted mb-4">Sign in to your management panel</p>
          
          {error && <div className="alert alert-danger py-2">{error}</div>}
          
          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email Address</Form.Label>
              <Form.Control type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" />
            </Form.Group>
            <Form.Group className="mb-4" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" />
            </Form.Group>
            <Button type="submit" className="w-100 py-2" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </Button>
            <div className="small text-muted mt-4 p-3 bg-light rounded border">
              <strong className="d-block mb-2">Demo Credentials:</strong>
              <div className="d-flex justify-content-between"><span>Admin:</span> <code>admin@turf.com</code></div>
              <div className="d-flex justify-content-between"><span>Manager:</span> <code>manager@turf.com</code></div>
              <div className="d-flex justify-content-between"><span>Staff:</span> <code>staff@turf.com</code></div>
              <div className="d-flex justify-content-between mt-2"><span>Password:</span> <code>(role)123</code></div>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}
